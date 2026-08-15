import { useEffect, useState, useCallback } from 'react';
import type { RdlResult, RdlCurrentResult } from '@/lib/supabase';
import {
  getTodayResult,
  getYesterdayResult,
  getCurrentResults,
  getMonthlyResults,
} from '@/lib/storage';

export function useResults() {
  const [todayResult, setTodayResult] = useState<RdlResult | null>(null);
  const [yesterdayResult, setYesterdayResult] = useState<RdlResult | null>(null);
  const [currentResults, setCurrentResults] = useState<RdlCurrentResult[]>([]);
  const [monthlyResults, setMonthlyResults] = useState<RdlResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [today, yesterday, current, monthly] = await Promise.all([
      getTodayResult(),
      getYesterdayResult(),
      getCurrentResults(),
      getMonthlyResults(),
    ]);
    setTodayResult(today);
    setYesterdayResult(yesterday);
    setCurrentResults(current);
    setMonthlyResults(monthly);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const onStorage = () => {
      fetchAll();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('rdl-storage-update', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('rdl-storage-update', onStorage);
    };
  }, [fetchAll]);

  return { todayResult, yesterdayResult, currentResults, monthlyResults, loading, refetch: fetchAll };
}
