import { useEffect, useState } from 'react';
import { TopHeader } from '@/components/TopHeader';
import { LiveCard } from '@/components/LiveCard';
import { ResultsSection } from '@/components/ResultsSection';
import { MonthlyChart } from '@/components/MonthlyChart';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { AdminPanel } from '@/components/AdminPanel';
import { useResults } from '@/hooks/useResults';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTheme } from '@/hooks/useTheme';

function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const handler = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}

function App() {
  const { todayResult, yesterdayResult, currentResults, monthlyResults, loading, refetch } = useResults();
  const settings = useSiteSettings();
  const { theme, toggleTheme } = useTheme();
  const route = useHashRoute();

  useEffect(() => {
    const interval = setInterval(refetch, settings.autoRefreshSeconds * 1000);
    return () => clearInterval(interval);
  }, [refetch, settings.autoRefreshSeconds]);

  const isAdminRoute = route === '#/admin' || route === '#/secret-admin';

  if (isAdminRoute) {
    return <AdminPanel onExit={() => { window.location.hash = ''; }} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 dark:bg-[#080d29] dark:text-white">
      <TopHeader theme={theme} onToggleTheme={toggleTheme} />
      {settings.showLiveCard && <LiveCard todayResult={todayResult} currentResults={currentResults} loading={loading} />}
      {settings.showResults && (
        <ResultsSection
          todayResult={todayResult}
          yesterdayResult={yesterdayResult}
          loading={loading}
        />
      )}
      {settings.showMonthlyChart && <MonthlyChart monthlyResults={monthlyResults} />}
      {settings.showContact && <ContactSection />}
      <Footer />
    </div>
  );
}

export default App;
