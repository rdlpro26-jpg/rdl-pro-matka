import { Send, MessageCircle, Phone, Users, Bell } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function ContactSection() {
  const settings = useSiteSettings();

  return (
    <section className="bg-gradient-to-b from-slate-100 to-slate-200 px-3 py-10 dark:from-[#080d29] dark:to-[#0b1033]">
      <div className="mx-auto max-w-[700px]">
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl md:text-4xl">Get In Touch</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-[#aeb9d5] sm:text-base">
            Join our community for live updates
          </p>
        </div>

        {/* Contact icons */}
        <div className="mb-8 flex items-center justify-center gap-5">
          <a
            href={settings.telegramLink}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-sky-300 bg-white text-sky-500 shadow-sm transition-all hover:scale-110 hover:border-sky-500 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:border-[#263b9c] dark:bg-[#11183e] dark:text-[#1692ff] dark:hover:border-[#087dff] dark:hover:shadow-[0_0_20px_rgba(0,125,255,0.3)]"
          >
            <Send className="h-7 w-7" />
          </a>
          <a
            href={settings.whatsappLink}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-300 bg-white text-emerald-500 shadow-sm transition-all hover:scale-110 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:border-[#263b9c] dark:bg-[#11183e] dark:text-[#49e886] dark:hover:border-[#49e886] dark:hover:shadow-[0_0_20px_rgba(73,232,134,0.3)]"
          >
            <MessageCircle className="h-7 w-7" />
          </a>
          <a
            href={settings.phoneLink}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-rose-500 shadow-sm transition-all hover:scale-110 hover:border-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] dark:border-[#263b9c] dark:bg-[#11183e] dark:text-[#ee283d] dark:hover:border-[#ee283d] dark:hover:shadow-[0_0_20px_rgba(238,40,61,0.3)]"
          >
            <Phone className="h-7 w-7" />
          </a>
        </div>

        {/* Telegram community card */}
        <div className="mb-6 rounded-2xl border-2 border-sky-200 bg-white p-7 text-center shadow-md dark:border-[#263b9c] dark:bg-gradient-to-br dark:from-[#11183e] dark:to-[#0d1336] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <Send className="mx-auto mb-3 h-10 w-10 text-sky-500 dark:text-[#1692ff]" />
          <h3 className="mb-2 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            Join Our Telegram Group
          </h3>
          <p className="mb-5 text-sm text-slate-600 dark:text-[#aeb9d5] sm:text-base">
            Get instant result notifications and updates
          </p>
          <a
            href={settings.telegramLink}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_5px_25px_rgba(56,189,248,0.4)] dark:from-[#1692ff] dark:to-[#087dff] dark:hover:shadow-[0_5px_25px_rgba(0,125,255,0.4)]"
          >
            <Send className="h-5 w-5" />
            JOIN TELEGRAM
          </a>
        </div>

        {/* Game updates card */}
        <div className="rounded-2xl border-2 border-sky-200 bg-white p-7 text-center shadow-md dark:border-[#263b9c] dark:bg-gradient-to-br dark:from-[#11183e] dark:to-[#0d1336] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <Users className="mx-auto mb-3 h-9 w-9 text-emerald-500 dark:text-[#49e886]" />
          <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white sm:text-xl">
            JOIN OUR GAME UPDATES GROUP
          </h3>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={settings.gameUpdatesLink}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-600 transition-all hover:border-emerald-500 hover:bg-emerald-100 dark:border-[#263b9c] dark:bg-[#0d1336] dark:text-[#49e886] dark:hover:border-[#49e886] dark:hover:bg-[#11183e] sm:w-auto"
            >
              <Users className="h-4 w-4" />
              Game Updates Group
            </a>
            <a
              href={settings.liveUpdatesLink}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-sky-300 bg-sky-50 px-6 py-3 text-sm font-bold text-sky-600 transition-all hover:border-sky-500 hover:bg-sky-100 dark:border-[#263b9c] dark:bg-[#0d1336] dark:text-[#1692ff] dark:hover:border-[#087dff] dark:hover:bg-[#11183e] sm:w-auto"
            >
              <Bell className="h-4 w-4" />
              Live Updates
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
