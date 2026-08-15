export interface SiteSettings {
  siteName: string;
  tagline: string;
  liveTitle: string;
  liveSubtitle: string;
  brandText: string;
  slotsTagline: string;
  telegramLink: string;
  whatsappLink: string;
  phoneLink: string;
  gameUpdatesLink: string;
  liveUpdatesLink: string;
  noticeTitle: string;
  noticeWarning: string;
  noticeBody: string;
  noticeBody2: string;
  footerTagline: string;
  footerDisclaimer: string;
  copyrightYear: string;
  showLiveCard: boolean;
  showResults: boolean;
  showMonthlyChart: boolean;
  showContact: boolean;
  autoRefreshSeconds: number;
}

const SETTINGS_KEY = 'rdl_site_settings';

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'RDL PRO MATKA',
  tagline: 'Daily 6 Draws  |  Live Results',
  liveTitle: 'RDL PRO LIVE',
  liveSubtitle: 'RESULT TODAY',
  brandText: 'RDLPROMATKA.COM',
  slotsTagline: 'All 6 time slots: 12PM, 2PM, 4PM, 6PM, 8PM, 10PM',
  telegramLink: '#',
  whatsappLink: '#',
  phoneLink: '#',
  gameUpdatesLink: '#',
  liveUpdatesLink: '#',
  noticeTitle: 'RDL PRO IMPORTANT NOTE',
  noticeWarning: 'If gambling is illegal in your state/country, please close this website immediately.',
  noticeBody: 'This website is for informational and entertainment purposes only. We do not encourage or promote any form of illegal gambling. Users must be of legal age to participate in any gambling activities as defined by their local jurisdiction.',
  noticeBody2: 'We are not responsible for any financial losses incurred through the use of information provided on this website. Please gamble responsibly and seek help if you have a gambling problem.',
  footerTagline: 'RDL Pro Matka — Your trusted source for live matka results',
  footerDisclaimer: 'This site is for informational purposes only. We do not promote or endorse any form of gambling. Users are advised to comply with their local laws.',
  copyrightYear: '2026',
  showLiveCard: true,
  showResults: true,
  showMonthlyChart: true,
  showContact: true,
  autoRefreshSeconds: 30,
};

export function getSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SiteSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('rdl-settings-update'));
}
