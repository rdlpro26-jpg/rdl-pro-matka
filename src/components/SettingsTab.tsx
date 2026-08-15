import { useState } from 'react';
import { Settings, Save, CheckCircle2, Eye, EyeOff, Lock, KeyRound, RotateCcw } from 'lucide-react';
import { getSettings, saveSettings, DEFAULT_SETTINGS, type SiteSettings } from '@/lib/settings';
import { verifyPassword, setPassword } from '@/lib/auth';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const inputBase = 'w-full rounded-xl border border-sky-500/30 bg-[#0a0f1e] px-4 py-3 text-sm font-semibold text-white placeholder-slate-600 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20';

function TextField({ label, value, onChange, placeholder, textarea }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${inputBase} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputBase}
        />
      )}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
        checked
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-white/10 bg-[#0a0f1e] text-slate-400'
      }`}
    >
      <span className="flex items-center gap-2">
        {checked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        {label}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0f1e] p-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(getSettings());
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveState('idle');
  };

  const handleSave = () => {
    setSaveState('saving');
    try {
      saveSettings(settings);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch {
      setSaveState('error');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaveState('idle');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121828] to-[#0e1420] p-5 shadow-xl shadow-black/20 sm:p-7">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
          <Settings className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">Site Settings</h2>
          <p className="text-xs text-slate-400">Control all text, links, and sections shown on the site</p>
        </div>
      </div>

      <div className="space-y-5">
        <SectionCard title="Header & Branding">
          <TextField label="Site Name" value={settings.siteName} onChange={(v) => update('siteName', v)} />
          <TextField label="Tagline" value={settings.tagline} onChange={(v) => update('tagline', v)} />
          <TextField label="Slots Tagline" value={settings.slotsTagline} onChange={(v) => update('slotsTagline', v)} />
        </SectionCard>

        <SectionCard title="Live Card">
          <TextField label="Live Title" value={settings.liveTitle} onChange={(v) => update('liveTitle', v)} />
          <TextField label="Live Subtitle" value={settings.liveSubtitle} onChange={(v) => update('liveSubtitle', v)} />
          <TextField label="Brand Text" value={settings.brandText} onChange={(v) => update('brandText', v)} />
        </SectionCard>

        <SectionCard title="Contact Links">
          <TextField label="Telegram Link" value={settings.telegramLink} onChange={(v) => update('telegramLink', v)} placeholder="https://t.me/..." />
          <TextField label="WhatsApp Link" value={settings.whatsappLink} onChange={(v) => update('whatsappLink', v)} placeholder="https://wa.me/..." />
          <TextField label="Phone Link" value={settings.phoneLink} onChange={(v) => update('phoneLink', v)} placeholder="tel:..." />
          <TextField label="Game Updates Link" value={settings.gameUpdatesLink} onChange={(v) => update('gameUpdatesLink', v)} />
          <TextField label="Live Updates Link" value={settings.liveUpdatesLink} onChange={(v) => update('liveUpdatesLink', v)} />
        </SectionCard>

        <SectionCard title="Footer Notice">
          <TextField label="Notice Title" value={settings.noticeTitle} onChange={(v) => update('noticeTitle', v)} />
          <TextField label="Notice Warning" value={settings.noticeWarning} onChange={(v) => update('noticeWarning', v)} textarea />
          <TextField label="Notice Body" value={settings.noticeBody} onChange={(v) => update('noticeBody', v)} textarea />
          <TextField label="Notice Body 2" value={settings.noticeBody2} onChange={(v) => update('noticeBody2', v)} textarea />
          <TextField label="Footer Tagline" value={settings.footerTagline} onChange={(v) => update('footerTagline', v)} />
          <TextField label="Footer Disclaimer" value={settings.footerDisclaimer} onChange={(v) => update('footerDisclaimer', v)} textarea />
          <TextField label="Copyright Year" value={settings.copyrightYear} onChange={(v) => update('copyrightYear', v)} />
        </SectionCard>

        <SectionCard title="Section Visibility">
          <ToggleField label="Show Live Card" checked={settings.showLiveCard} onChange={(v) => update('showLiveCard', v)} />
          <ToggleField label="Show Results Section" checked={settings.showResults} onChange={(v) => update('showResults', v)} />
          <ToggleField label="Show Monthly Chart" checked={settings.showMonthlyChart} onChange={(v) => update('showMonthlyChart', v)} />
          <ToggleField label="Show Contact Section" checked={settings.showContact} onChange={(v) => update('showContact', v)} />
        </SectionCard>

        <SectionCard title="Auto-Refresh">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Auto-Refresh Interval (seconds)
            </label>
            <input
              type="number"
              min={5}
              max={300}
              value={settings.autoRefreshSeconds}
              onChange={(e) => update('autoRefreshSeconds', Math.max(5, Math.min(300, Number(e.target.value) || 30)))}
              className={inputBase}
            />
          </div>
        </SectionCard>

        <PasswordSection />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
        >
          {saveState === 'saving' ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : saveState === 'saved' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-bold text-slate-400 transition-all hover:border-white/20 hover:text-slate-200"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </button>
        {saveState === 'saved' && (
          <span className="text-sm font-semibold text-emerald-400">
            Settings saved. The site will update instantly.
          </span>
        )}
      </div>
    </div>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwState, setPwState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (!verifyPassword(currentPassword)) {
      setPwError('Current password is incorrect.');
      setPwState('error');
      return;
    }
    if (newPassword.length < 4) {
      setPwError('New password must be at least 4 characters.');
      setPwState('error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match.');
      setPwState('error');
      return;
    }

    setPwState('saving');
    setPassword(newPassword);
    setPwState('saved');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwState('idle'), 2500);
  };

  const inputClass = `${inputBase} pr-12`;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0f1e] p-5">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-emerald-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Change Admin Password</h3>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setPwState('idle'); }}
              placeholder="Enter current password"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
            >
              {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwState('idle'); }}
                placeholder="Enter new password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
              >
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Confirm New Password
            </label>
            <input
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPwState('idle'); }}
              placeholder="Re-enter new password"
              className={inputBase}
            />
          </div>
        </div>

        {pwError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400">
            {pwError}
          </div>
        )}
        {pwState === 'saved' && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
            Password changed successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={pwState === 'saving' || !currentPassword || !newPassword || !confirmPassword}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          Update Password
        </button>
      </form>
    </div>
  );
}
