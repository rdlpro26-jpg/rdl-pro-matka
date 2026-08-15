import { useCallback, useEffect, useState } from 'react';
import { Save, CheckCircle2, Calendar, Home, Radio, LayoutGrid, Settings, LogOut, Wand2 } from 'lucide-react';
import { TIME_SLOTS, type RdlResult, type RdlCurrentResult } from '@/lib/supabase';
import {
  saveLiveResult,
  saveDailyResult,
  getResultByDate,
  getCurrentResults,
  backfillMissingResults,
  slotNameFromShort,
} from '@/lib/storage';
import { SettingsTab } from '@/components/SettingsTab';
import { LoginScreen } from '@/components/LoginScreen';
import { isAuthed, setAuthed } from '@/lib/auth';

interface AdminPanelProps {
  onExit: () => void;
}

const SLOT_KEYS = TIME_SLOTS.map((s) => s.key);

type Tab = 'live' | 'daily' | 'settings';
type SlotValues = Record<string, string>;
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function AdminPanel({ onExit }: AdminPanelProps) {
  const [authed, setAuthedState] = useState(isAuthed());
  const [tab, setTab] = useState<Tab>('live');

  const handleLogout = () => {
    setAuthed(false);
    setAuthedState(false);
    onExit();
  };

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthedState(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] via-[#0d1424] to-[#0a0f1e] font-sans text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0f1e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[920px] items-center justify-between gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Site</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-base font-bold text-white sm:text-lg">Admin Panel</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-all hover:border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="sticky top-[61px] z-10 border-b border-white/5 bg-[#0a0f1e]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[920px] gap-2 px-4 py-3">
          <TabButton active={tab === 'live'} onClick={() => setTab('live')} icon={Radio} label="Live Number" />
          <TabButton active={tab === 'daily'} onClick={() => setTab('daily')} icon={LayoutGrid} label="Daily (6 Slots)" />
          <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings} label="Site Settings" />
        </div>
      </div>

      <main className="mx-auto max-w-[920px] px-4 py-6 pb-12">
        {tab === 'live' && <LiveTab />}
        {tab === 'daily' && <DailyTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: typeof Radio;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition-all duration-200 sm:text-sm ${
        active
          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
          : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  );
}

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={onClick}
        disabled={state === 'saving'}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
      >
        {state === 'saving' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : state === 'saved' ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {state === 'saving' ? 'Saving...' : state === 'saved' ? 'Saved!' : 'Save Results'}
      </button>
      {state === 'saved' && (
        <span className="text-sm font-semibold text-emerald-400">
          Results saved successfully. The site will update shortly.
        </span>
      )}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400">
      {msg}
    </div>
  );
}

/* ════════════════ LIVE TAB ════════════════ */
function LiveTab() {
  const today = new Date();
  const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0].key);
  const [liveValue, setLiveValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSlot = useCallback(async (slotKey: string, date: string) => {
    setLoading(true);
    setSaveState('idle');
    setErrorMsg('');
    const slot = TIME_SLOTS.find((s) => s.key === slotKey)!;
    const slotName = slotNameFromShort(slot.short);
    let found: RdlCurrentResult | undefined;
    if (date === todayLocal) {
      const current = await getCurrentResults();
      found = current.find((r) => r.slot_name === slotName);
    }
    if (!found) {
      const dayRow = await getResultByDate(date);
      const slotVal = dayRow ? (dayRow as unknown as Record<string, string | null>)[slotKey] : null;
      if (slotVal) {
        found = { id: slotKey, slot_name: slotName, result_value: slotVal, previous_value: null, updated_at: '' };
      }
    }
    setLiveValue(found?.result_value && found.result_value !== 'WAIT' ? found.result_value : '');
    setLoading(false);
  }, [todayLocal]);

  useEffect(() => {
    loadSlot(selectedSlot, selectedDate);
  }, [selectedSlot, selectedDate, loadSlot]);

  const handleSave = async () => {
    setSaveState('saving');
    setErrorMsg('');
    try {
      await saveLiveResult({ slotKey: selectedSlot, value: liveValue, date: selectedDate });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const cleanNum = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 2);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121828] to-[#0e1420] p-5 shadow-xl shadow-black/20 sm:p-7">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
          <Radio className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">Live Number Entry</h2>
          <p className="text-xs text-slate-400">Pick a date and slot, enter the number — chart and slots update instantly</p>
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Calendar className="h-4 w-4 text-emerald-400" />
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-3 text-sm font-semibold text-white transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 [color-scheme:dark]"
        />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {TIME_SLOTS.map((slot) => (
          <button
            type="button"
            key={slot.key}
            onClick={() => setSelectedSlot(slot.key)}
            className={`rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-200 ${
              selectedSlot === slot.key
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            {slot.short}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-sky-500" />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/10 bg-[#0a0f1e] p-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="XX"
              value={liveValue}
              onChange={(e) => { setLiveValue(cleanNum(e.target.value)); setSaveState('idle'); }}
              className="w-full rounded-xl border border-sky-500/30 bg-[#0d1424] px-4 py-4 text-center text-3xl font-black text-white placeholder-slate-600 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              maxLength={2}
            />
          </div>

          <ErrorBox msg={errorMsg} />
          <SaveButton state={saveState} onClick={handleSave} />
        </>
      )}
    </div>
  );
}

/* ════════════════ DAILY TAB ════════════════ */
function DailyTab() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(today);
  const [values, setValues] = useState<SlotValues>({});
  const [existingRow, setExistingRow] = useState<RdlResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const loadDate = useCallback(async (date: string) => {
    setLoading(true);
    setSaveState('idle');
    setErrorMsg('');
    const data = await getResultByDate(date);
    setExistingRow(data);
    const initial: SlotValues = {};
    for (const key of SLOT_KEYS) {
      initial[key] = (data?.[key as keyof RdlResult] as string) ?? '';
    }
    setValues(initial);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDate(selectedDate);
  }, [selectedDate, loadDate]);

  const handleValueChange = (key: string, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 2);
    setValues((prev) => ({ ...prev, [key]: cleaned }));
    setSaveState('idle');
  };

  const handleSave = async () => {
    setSaveState('saving');
    setErrorMsg('');
    try {
      await saveDailyResult(selectedDate, values);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121828] to-[#0e1420] p-5 shadow-xl shadow-black/20 sm:p-7">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
          <LayoutGrid className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">Daily Results &mdash; All 6 Slots</h2>
          <p className="text-xs text-slate-400">Enter results for all time slots of a selected date</p>
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Calendar className="h-4 w-4 text-emerald-400" />
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-3 text-sm font-semibold text-white transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-sky-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TIME_SLOTS.map((slot) => (
              <div key={slot.key} className="rounded-xl border border-white/10 bg-[#0a0f1e] p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  {slot.label}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="XX"
                  value={values[slot.key] ?? ''}
                  onChange={(e) => handleValueChange(slot.key, e.target.value)}
                  className="w-full rounded-lg border border-sky-500/30 bg-[#0d1424] px-4 py-3 text-center text-2xl font-black text-white placeholder-slate-600 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  maxLength={2}
                />
              </div>
            ))}
          </div>

          <ErrorBox msg={errorMsg} />
          <SaveButton state={saveState} onClick={handleSave} />

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
                <Wand2 className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Auto-Fill Missing History</h3>
                <p className="text-xs text-slate-400">Fills blank slots with random 2-digit numbers for the past 30 days (excluding today)</p>
              </div>
            </div>
            <BackfillButton />
          </div>
        </>
      )}
    </div>
  );
}

function BackfillButton() {
  const [state, setState] = useState<'idle' | 'filling' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleBackfill = async () => {
    setState('filling');
    setMessage('');
    try {
      const result = await backfillMissingResults(30);
      setState('done');
      setMessage(result.filled > 0
        ? `Filled ${result.filled} day(s) with random numbers.`
        : 'No missing entries found — all days already have data.');
      setTimeout(() => setState('idle'), 3500);
    } catch {
      setState('error');
      setMessage('Failed to backfill. Please try again.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={handleBackfill}
        disabled={state === 'filling'}
        className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-300 transition-all hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-200 disabled:opacity-50"
      >
        {state === 'filling' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400/40 border-t-amber-400" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {state === 'filling' ? 'Filling...' : 'Auto-Fill Missing Days'}
      </button>
      {state === 'done' && (
        <span className="text-sm font-semibold text-emerald-400">{message}</span>
      )}
      {state === 'error' && (
        <span className="text-sm font-semibold text-rose-400">{message}</span>
      )}
    </div>
  );
}
