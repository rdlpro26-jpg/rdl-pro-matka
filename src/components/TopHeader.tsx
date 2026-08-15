import { Star, Clock, Sun, Moon } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface TopHeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function TopHeader({ theme, onToggleTheme }: TopHeaderProps) {
  const settings = useSiteSettings();

  return (
    <header className="relative overflow-hidden border-b-[3px] border-[#2578ff] bg-gradient-to-br from-[#0a58d8] via-[#145ee8] to-[#2633a8] px-4 pb-8 pt-9 text-center">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -left-[70px] -top-[100px] h-[180px] w-[180px] rounded-full bg-white/[0.08]" />
      <div className="pointer-events-none absolute -bottom-[130px] -right-[110px] h-[220px] w-[220px] rounded-full bg-[#5064ff]/15" />

      {/* Center-top theme toggle */}
      <button
        onClick={onToggleTheme}
        className="absolute left-1/2 top-3 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative z-10 mx-auto max-w-2xl">
        <h1 className="text-3xl font-black leading-tight text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.30)] sm:text-4xl md:text-5xl">
          <Star className="inline-block h-6 w-6 fill-[#ffd83d] text-[#ffd83d] sm:h-8 sm:w-8" />{' '}
          {settings.siteName}{' '}
          <Star className="inline-block h-6 w-6 fill-[#ffd83d] text-[#ffd83d] sm:h-8 sm:w-8" />
        </h1>
        <p className="mt-3 text-sm font-semibold text-[#dce9ff] sm:text-lg md:text-xl">
          {settings.tagline}
        </p>
      </div>

      <div className="relative z-10 mt-5 flex min-h-[52px] items-center justify-center rounded-xl bg-[#0b1235] px-3 py-3 text-center">
        <p className="flex items-center gap-2 text-xs font-bold text-[#49e886] sm:text-sm md:text-base">
          <Clock className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span>{settings.slotsTagline}</span>
        </p>
      </div>
    </header>
  );
}
