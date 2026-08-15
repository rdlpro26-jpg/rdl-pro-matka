import { useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, Search } from 'lucide-react';
import { TIME_SLOTS, type RdlResult } from '@/lib/supabase';

interface MonthlyChartProps {
  monthlyResults: RdlResult[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthlyChart({ monthlyResults }: MonthlyChartProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const today = now.getDate();
  const todayDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [searchDate, setSearchDate] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const rowsByDate = useMemo(() => {
    const map = new Map<string, RdlResult>();
    for (const row of monthlyResults) {
      map.set(row.draw_date, row);
    }
    return map;
  }, [monthlyResults]);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, selectedMonth + 1, 0).getDate();
  }, [currentYear, selectedMonth]);

  const isCurrentMonth = selectedMonth === currentMonth;
  const maxDay = isCurrentMonth ? today : daysInMonth;

  const tableRows = useMemo(() => {
    return Array.from({ length: maxDay }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const existing = rowsByDate.get(dateStr);
      const slots = TIME_SLOTS.map((slot) => existing?.[slot.key] ?? null);
      const isSearchMatch = searchDate === dateStr;
      return { day, slots, isToday: isCurrentMonth && day === today, isSearchMatch, dateStr };
    });
  }, [maxDay, rowsByDate, selectedMonth, currentYear, isCurrentMonth, today, searchDate]);

  const handleDateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchDate(value);
    if (value) {
      const [, m] = value.split('-');
      const monthIdx = Number(m) - 1;
      if (monthIdx >= 0 && monthIdx <= 11) {
        setSelectedMonth(monthIdx);
      }
    }
  };

  const highlightRowRef = useRef<HTMLTableRowElement>(null);
  useMemo(() => {
    if (searchDate && highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchDate, tableRows]);

  return (
    <section className="bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 px-2 pb-10 pt-2 dark:from-[#0a0f1e] dark:via-[#0d1424] dark:to-[#0a0f1e] sm:px-3">
      <div className="mx-auto max-w-[1100px]">
        {/* Header bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-3 text-center sm:justify-start sm:px-5 sm:py-4 dark:border-white/10 dark:from-sky-600/15 dark:to-blue-700/10">
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                value={searchDate}
                onChange={handleDateSearch}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                max={todayDateStr}
              />
              <Calendar className="h-5 w-5 cursor-pointer text-emerald-500 transition-transform hover:scale-110 dark:text-emerald-400" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg md:text-xl">
              MONTHLY CHART &mdash; {MONTH_NAMES[selectedMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500 dark:text-sky-400" />
              <input
                type="date"
                value={searchDate}
                onChange={handleDateSearch}
                className="w-full rounded-xl border border-sky-300 bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-slate-900 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-sky-500/30 dark:bg-[#0a0f1e] dark:text-white dark:[color-scheme:dark] sm:w-auto sm:py-3 [&[type=date]]:[color-scheme:light] dark:[&[type=date]]:[color-scheme:dark]"
                max={todayDateStr}
              />
            </div>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setSearchDate('');
                }}
                className="w-full appearance-none rounded-xl border border-sky-300 bg-white px-3 py-2.5 pr-9 text-sm font-bold text-slate-900 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-sky-500/30 dark:bg-[#0a0f1e] dark:text-white sm:w-auto sm:px-4 sm:py-3 sm:pr-10"
              >
                {MONTH_NAMES.map((month, idx) => (
                  <option key={month} value={idx} className="bg-white dark:bg-[#0a0f1e]">
                    {month} {currentYear}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500 dark:text-sky-400" />
            </div>
          </div>
        </div>

        {/* Compact table — fits 7 columns on mobile without horizontal scroll */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-gradient-to-b dark:from-[#121828] dark:to-[#0e1420] dark:shadow-xl dark:shadow-black/20">
          <table className="w-full table-fixed border-collapse text-center">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-r from-sky-100 to-blue-100 dark:border-white/10 dark:from-sky-500/15 dark:to-blue-600/15">
                <th className="w-[18%] px-1 py-2.5 text-[11px] font-bold text-slate-900 sm:px-4 sm:py-3 sm:text-sm dark:text-white">
                  DATE
                </th>
                {TIME_SLOTS.map((slot) => (
                  <th
                    key={slot.key}
                    className="w-[13.66%] px-0.5 py-2.5 text-[10px] font-bold text-sky-600 sm:px-4 sm:py-3 sm:text-sm dark:text-sky-400"
                  >
                    <span className="hidden sm:inline">RDL PRO {slot.short}</span>
                    <span className="sm:hidden">{slot.short}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => {
                const isAlt = i % 2 === 1;
                return (
                  <tr
                    key={row.day}
                    ref={row.isSearchMatch ? highlightRowRef : undefined}
                    className={`${isAlt ? 'bg-slate-50 dark:bg-white/[0.02]' : 'bg-transparent'} ${
                      row.isToday ? 'bg-emerald-100 ring-2 ring-inset ring-emerald-400 dark:bg-emerald-500/15 dark:ring-emerald-400 dark:shadow-[inset_0_0_15px_rgba(52,211,153,0.15)]' : ''
                    } ${row.isSearchMatch ? 'bg-amber-100 !ring-2 ring-inset ring-amber-500/60 dark:bg-amber-500/10' : ''} transition-colors`}
                  >
                    <td className="px-1 py-2 text-[11px] font-bold text-slate-700 sm:px-4 sm:py-2.5 sm:text-sm dark:text-slate-300">
                      <span className={row.isToday ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                        {String(row.day).padStart(2, '0')} {MONTH_NAMES[selectedMonth].slice(0, 3)}
                      </span>
                    </td>
                    {row.slots.map((val, idx) => (
                      <td
                        key={idx}
                        className={`px-0.5 py-2 text-[11px] font-bold sm:px-4 sm:py-2.5 sm:text-sm ${
                          val ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {val ?? 'XX'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
