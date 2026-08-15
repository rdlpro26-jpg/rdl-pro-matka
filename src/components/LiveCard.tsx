import { useEffect, useState } from 'react';
import { Radio, RefreshCw, Timer } from 'lucide-react';
import { TIME_SLOTS, type RdlResult, type RdlCurrentResult } from '@/lib/supabase';
import { slotNameFromShort } from '@/lib/storage';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface LiveCardProps {
  todayResult: RdlResult | null;
  currentResults: RdlCurrentResult[];
  loading: boolean;
}

const SLOT_MINUTES = TIME_SLOTS.map((slot) => {
  const match = slot.short.match(/^(\d{1,2})(AM|PM)$/);
  if (!match) throw new Error(`Invalid slot time: ${slot.short}`);
  const hour = Number.parseInt(match[1], 10) % 12 + (match[2] === 'PM' ? 12 : 0);
  return hour * 60;
});
const EARLY_SWITCH_MINUTES = 5;
const IST_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getIndiaMinutes(date: Date): number {
  const parts = IST_TIME_FORMATTER.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  const second = Number(parts.find((part) => part.type === 'second')?.value ?? 0);
  return hour * 60 + minute + second / 60;
}

function getActiveSlotIndex(date: Date): number {
  const minutesNow = getIndiaMinutes(date);
  let activeIdx = 0;
  for (let i = 0; i < SLOT_MINUTES.length; i += 1) {
    if (minutesNow >= SLOT_MINUTES[i] - EARLY_SWITCH_MINUTES) activeIdx = i;
  }
  return activeIdx;
}

function getNextSlotInfo(date: Date): { label: string; totalSeconds: number } {
  const minutesNow = getIndiaMinutes(date);
  const nextSlotMinutes = SLOT_MINUTES.find((slotMinutes) => slotMinutes > minutesNow);
  const minutesUntilNext = nextSlotMinutes === undefined
    ? SLOT_MINUTES[0] + 24 * 60 - minutesNow
    : nextSlotMinutes - minutesNow;
  const nextIndex = nextSlotMinutes === undefined ? 0 : SLOT_MINUTES.indexOf(nextSlotMinutes);

  return {
    label: TIME_SLOTS[nextIndex].label,
    totalSeconds: Math.ceil(minutesUntilNext * 60),
  };
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function LiveCard({ todayResult, currentResults, loading }: LiveCardProps) {
  const settings = useSiteSettings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeIdx = getActiveSlotIndex(now);
  const activeSlot = TIME_SLOTS[activeIdx];
  const nextSlotInfo = getNextSlotInfo(now);
  const isSwitchingSoon = nextSlotInfo.totalSeconds <= EARLY_SWITCH_MINUTES * 60;

  const slotName = slotNameFromShort(activeSlot.short);
  const currentSlot = currentResults.find((r) => r.slot_name === slotName);
  const liveValue = currentSlot?.result_value && currentSlot.result_value !== 'WAIT'
    ? currentSlot.result_value
    : (todayResult?.[activeSlot.key] ?? 'WAIT');

  return (
    <section className="bg-gradient-to-b from-slate-200 to-slate-100 px-3 pb-11 pt-6 dark:from-[#080d29] dark:to-[#0b1033]">
      <div className="mx-auto max-w-[650px] overflow-hidden rounded-[18px] border-2 border-slate-300 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.08)] dark:border-[#263b9c] dark:bg-[#11183e] dark:shadow-[0_15px_45px_rgba(0,0,0,0.35),0_0_30px_rgba(50,90,255,0.08)]">
        <div className="flex min-h-[125px] items-center justify-center border-b-4 border-[#791d45] bg-gradient-to-br from-[#ee283d] to-[#c91e52] px-4 py-8 text-center">
          <h2 className="text-2xl font-black leading-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)] sm:text-3xl md:text-[38px]">
            {settings.liveTitle}
            <br />
            {settings.liveSubtitle}
          </h2>
        </div>

        <div className="mx-auto my-6 flex min-h-[82px] w-[calc(100%-36px)] items-center justify-center gap-3 rounded-2xl border-2 border-sky-400 bg-gradient-to-br from-sky-50 to-blue-100 px-4 py-4 text-center shadow-sm dark:border-[#087dff] dark:from-[#101c50] dark:to-[#0d153c] dark:shadow-[0_0_20px_rgba(0,125,255,0.12)]">
          <Radio className="h-6 w-6 text-sky-500 dark:text-[#1692ff] sm:h-7 sm:w-7" />
          <span className="text-lg font-black text-sky-600 dark:text-[#168dff] sm:text-2xl">{settings.brandText}</span>
          <span className="h-3 w-3 shrink-0 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.5)] dark:bg-[#168dff] dark:shadow-[0_0_12px#168dff]" />
        </div>

        <div className="mx-auto mb-5 grid w-[calc(100%-36px)] grid-cols-1 gap-3">
          <div className="rounded-2xl border-2 border-sky-400 bg-gradient-to-br from-sky-50 to-blue-100 px-3 py-6 text-center shadow-sm dark:border-[#087dff] dark:from-[#101c50] dark:to-[#0d153c] dark:shadow-[0_0_24px_rgba(0,125,255,0.16)] sm:py-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-[#aeb9d5] sm:text-xs">
              Live
            </p>
            <p className="mb-2 text-sm font-black text-sky-600 dark:text-[#168dff] sm:text-base">
              {activeSlot.label}
            </p>
            <p
              className={`text-4xl font-black sm:text-5xl ${
                liveValue === 'WAIT' ? 'text-amber-500 dark:text-[#ffe35c]' : 'text-emerald-600 dark:text-[#49e886]'
              }`}
            >
              {loading ? '--' : liveValue}
            </p>
            {liveValue !== 'WAIT' ? (
              <p className="mt-3 text-[10px] font-semibold text-slate-500 dark:text-[#aeb9d5] sm:text-xs">{activeSlot.label.replace(' ', '')}</p>
            ) : null}
          </div>
        </div>

        <div
          className={`mx-auto mb-5 flex w-[calc(100%-36px)] flex-col items-center justify-center gap-1 rounded-xl border-2 px-4 py-3 text-center transition-all duration-500 ${
            isSwitchingSoon
              ? 'border-amber-400 bg-amber-50 text-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.15)] dark:border-[#ffe35c] dark:bg-[#ffe35c]/10 dark:text-[#ffe35c] dark:shadow-[0_0_20px_rgba(255,227,92,0.15)]'
              : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-[#263b9c] dark:bg-[#0d153c] dark:text-[#aeb9d5]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Timer className={`h-4 w-4 ${isSwitchingSoon ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold sm:text-sm">
              {isSwitchingSoon
                ? `Switching to ${nextSlotInfo.label}`
                : `Next: ${nextSlotInfo.label}`}
            </span>
          </div>
          {isSwitchingSoon ? (
            <span className="text-2xl font-black tabular-nums tracking-wider text-amber-600 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] dark:text-[#ffe35c] dark:drop-shadow-[0_0_8px_rgba(255,227,92,0.4)]">
              {formatCountdown(nextSlotInfo.totalSeconds)}
            </span>
          ) : (
            <span className="text-sm font-bold tabular-nums text-slate-600 dark:text-[#aeb9d5]">
              {formatCountdown(nextSlotInfo.totalSeconds)}
            </span>
          )}
        </div>

        <div className="mx-auto mb-5 flex items-center justify-center gap-2 px-4 pb-2 text-xs text-slate-500 dark:text-[#aeb9d5] sm:text-sm">
          <RefreshCw className="h-3.5 w-3.5 animate-spin [animation-duration:3s]" />
          <span>Auto-refresh every {settings.autoRefreshSeconds}s</span>
        </div>
      </div>
    </section>
  );
}
