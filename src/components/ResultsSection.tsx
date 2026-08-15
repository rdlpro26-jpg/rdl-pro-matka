import { useEffect, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { TIME_SLOTS, type RdlResult } from '@/lib/supabase';

interface ResultsSectionProps {
  todayResult: RdlResult | null;
  yesterdayResult: RdlResult | null;
  loading: boolean;
}

export function ResultsSection({ todayResult, yesterdayResult, loading }: ResultsSectionProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <section className="bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 px-3 pb-10 pt-5 text-slate-900 dark:from-[#0a0f1e] dark:via-[#0d1424] dark:to-[#0a0f1e] dark:text-white">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-100 via-blue-100 to-slate-100 px-5 py-7 text-center shadow-lg dark:border-white/10 dark:from-sky-600/20 dark:via-blue-700/15 dark:to-[#0e1420] dark:shadow-xl dark:shadow-black/20">
          <h1 className="mb-4 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            RDL PRO MATKA RESULT
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:text-sm">
              <CalendarDays className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:text-sm">
              <Clock className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              {timeStr}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIME_SLOTS.map((slot) => {
            const currentValue = todayResult?.[slot.key] ?? null;
            const yesterdayValue = yesterdayResult?.[slot.key] ?? null;

            return (
              <div
                key={slot.key}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all hover:border-sky-300 hover:shadow-lg dark:border-white/10 dark:bg-gradient-to-b dark:from-[#121828] dark:to-[#0e1420] dark:shadow-lg dark:shadow-black/20 dark:hover:border-white/20 dark:hover:shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-3 dark:border-white/5 dark:from-sky-500/15 dark:to-blue-600/15">
                  <span className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">{slot.label}</span>
                  <span className="rounded-full border border-sky-300 bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400">
                    {slot.short}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                  <div className="order-2 rounded-xl border border-sky-200 bg-sky-50 px-2 py-4 text-center dark:border-sky-500/20 dark:bg-[#0a0f1e]">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs">
                      Today
                    </p>
                    {loading ? (
                      <span className="text-2xl font-black text-slate-400 dark:text-slate-600">--</span>
                    ) : currentValue ? (
                      <span className="text-3xl font-black text-sky-600 dark:text-sky-400">{currentValue}</span>
                    ) : (
                      <span className="text-2xl font-black text-slate-400 dark:text-slate-600">XX</span>
                    )}
                  </div>
                  <div className="order-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs">
                      Yesterday
                    </p>
                    <span className="text-3xl font-black text-slate-400 dark:text-slate-500">
                      {loading ? '--' : yesterdayValue ?? 'XX'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
          Results update automatically.
          <br />
          Please check back for the latest result.
        </p>
      </div>
    </section>
  );
}
