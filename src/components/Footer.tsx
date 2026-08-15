import { AlertTriangle, Shield, FileText, Map, Info, Mail, FileWarning, Heart } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const FOOTER_LINKS = [
  { label: 'Privacy Policy', icon: FileText, href: '#' },
  { label: 'Sitemap', icon: Map, href: '#' },
  { label: 'About Us', icon: Info, href: '#' },
  { label: 'Contact Us', icon: Mail, href: '#' },
  { label: 'Disclaimer', icon: FileWarning, href: '#' },
];

export function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className="bg-slate-200 text-slate-900 dark:bg-[#080d29] dark:text-white">
      {/* Important notice */}
      <div className="px-3 py-10">
        <div className="mx-auto max-w-[700px] rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100 p-7 shadow-md dark:border-[#791d45] dark:from-[#1a0d2e] dark:to-[#0d0820] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="mb-4 flex items-center justify-center gap-2">
            <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-[#ffe35c]" />
            <h3 className="text-xl font-black text-amber-600 dark:text-[#ffe35c] sm:text-2xl">{settings.noticeTitle}</h3>
          </div>
          <p className="mb-4 text-center text-sm font-bold leading-relaxed text-amber-600 dark:text-[#ffe35c] sm:text-base">
            {settings.noticeWarning}
          </p>
          <p className="text-center text-sm leading-relaxed text-slate-700 dark:text-white sm:text-base">
            {settings.noticeBody}
          </p>
          <p className="mt-4 text-center text-sm leading-relaxed text-slate-700 dark:text-white sm:text-base">
            {settings.noticeBody2}
          </p>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-slate-300 px-3 py-6 dark:border-[#263b9c]/40">
        <div className="mx-auto flex max-w-[700px] flex-wrap items-center justify-center gap-3 sm:gap-5">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-[#aeb9d5] dark:hover:text-white"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-slate-300 px-3 py-8 dark:bg-[#050818]">
        <div className="mx-auto max-w-[700px] text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600 dark:text-[#49e886]" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">FASTEST RESULT IS HERE</h3>
          </div>
          <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-[#aeb9d5]">
            {settings.footerTagline}
          </p>
          <p className="mb-4 text-xs text-slate-500 dark:text-[#6b7794]">
            {settings.footerDisclaimer}
          </p>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-[#6b7794]">
            <span>&copy; {settings.copyrightYear} RDL Pro Matka.</span>
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 fill-[#ee283d] text-[#ee283d]" />
            <span>All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
