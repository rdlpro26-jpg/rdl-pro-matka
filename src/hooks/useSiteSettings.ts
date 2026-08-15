import { useEffect, useState } from 'react';
import { getSettings, type SiteSettings } from '@/lib/settings';

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);

  useEffect(() => {
    const onUpdate = () => setSettings(getSettings());
    window.addEventListener('rdl-settings-update', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('rdl-settings-update', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  return settings;
}
