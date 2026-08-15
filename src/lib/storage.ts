import { supabase, TIME_SLOTS, type RdlResult, type RdlCurrentResult } from '@/lib/supabase';

export function slotNameFromShort(short: string): string {
  const match = short.match(/^(\d{1,2})(AM|PM)$/);
  if (!match) return `RDLPRO ${short}`;
  return `RDLPRO ${Number(match[1])} ${match[2]}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ────────── Local storage fallback ────────── */

const LS_RESULTS_KEY = 'rdl_local_results';
const LS_CURRENT_KEY = 'rdl_local_current';

/* Every Supabase failure — network, auth, RLS, expired key — falls back to localStorage
   so the admin save feature never throws an uncaught error. */

function readLocalResults(): RdlResult[] {
  try {
    const raw = localStorage.getItem(LS_RESULTS_KEY);
    return raw ? (JSON.parse(raw) as RdlResult[]) : [];
  } catch {
    return [];
  }
}

function writeLocalResults(rows: RdlResult[]): void {
  try {
    localStorage.setItem(LS_RESULTS_KEY, JSON.stringify(rows));
  } catch {
    /* storage full or unavailable — nothing we can do */
  }
}

function readLocalCurrent(): RdlCurrentResult[] {
  try {
    const raw = localStorage.getItem(LS_CURRENT_KEY);
    return raw ? (JSON.parse(raw) as RdlCurrentResult[]) : [];
  } catch {
    return [];
  }
}

function writeLocalCurrent(rows: RdlCurrentResult[]): void {
  try {
    localStorage.setItem(LS_CURRENT_KEY, JSON.stringify(rows));
  } catch {
    /* storage full or unavailable */
  }
}

function upsertLocalResult(row: Partial<RdlResult> & { draw_date: string }): void {
  const rows = readLocalResults();
  const idx = rows.findIndex((r) => r.draw_date === row.draw_date);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...row, updated_at: new Date().toISOString() };
  } else {
    rows.push({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slot_12pm: null,
      slot_2pm: null,
      slot_4pm: null,
      slot_6pm: null,
      slot_8pm: null,
      slot_10pm: null,
      ...row,
    });
  }
  writeLocalResults(rows);
}

function upsertLocalCurrent(slotName: string, resultValue: string, prevVal: string | null): void {
  const rows = readLocalCurrent();
  const idx = rows.findIndex((r) => r.slot_name === slotName);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], result_value: resultValue, previous_value: prevVal, updated_at: new Date().toISOString() };
  } else {
    rows.push({
      id: crypto.randomUUID(),
      slot_name: slotName,
      result_value: resultValue,
      previous_value: prevVal,
      updated_at: new Date().toISOString(),
    });
  }
  writeLocalCurrent(rows);
}

/* ────────── Read functions (Supabase with localStorage fallback) ────────── */

export async function getTodayResult(): Promise<RdlResult | null> {
  try {
    const { data, error } = await supabase
      .from('rdl_results')
      .select('*')
      .eq('draw_date', todayStr())
      .maybeSingle();
    if (error) throw error;
    return data as RdlResult | null;
  } catch {
    const rows = readLocalResults();
    return rows.find((r) => r.draw_date === todayStr()) ?? null;
  }
}

export async function getYesterdayResult(): Promise<RdlResult | null> {
  const yesterday = dateStr(new Date(Date.now() - 86400000));
  try {
    const { data, error } = await supabase
      .from('rdl_results')
      .select('*')
      .eq('draw_date', yesterday)
      .maybeSingle();
    if (error) throw error;
    return data as RdlResult | null;
  } catch {
    const rows = readLocalResults();
    return rows.find((r) => r.draw_date === yesterday) ?? null;
  }
}

export async function getCurrentResults(): Promise<RdlCurrentResult[]> {
  try {
    const { data, error } = await supabase
      .from('rdl_current_result')
      .select('*')
      .order('slot_name', { ascending: true });
    if (error) throw error;
    if (!data) throw new Error('No data');

    const existingNames = new Set(data.map((r) => r.slot_name));
    const result = [...data] as RdlCurrentResult[];

    for (const slot of TIME_SLOTS) {
      const slotName = slotNameFromShort(slot.short);
      if (!existingNames.has(slotName)) {
        result.push({
          id: slot.key,
          slot_name: slotName,
          result_value: 'WAIT',
          previous_value: null,
          updated_at: new Date().toISOString(),
        });
      }
    }
    return result.sort((a, b) => a.slot_name.localeCompare(b.slot_name));
  } catch {
    const localRows = readLocalCurrent();
    const existingNames = new Set(localRows.map((r) => r.slot_name));
    const result = [...localRows];

    for (const slot of TIME_SLOTS) {
      const slotName = slotNameFromShort(slot.short);
      if (!existingNames.has(slotName)) {
        result.push({
          id: slot.key,
          slot_name: slotName,
          result_value: 'WAIT',
          previous_value: null,
          updated_at: new Date().toISOString(),
        });
      }
    }
    return result.sort((a, b) => a.slot_name.localeCompare(b.slot_name));
  }
}

export async function getMonthlyResults(): Promise<RdlResult[]> {
  const year = new Date().getFullYear();
  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;
  try {
    const { data, error } = await supabase
      .from('rdl_results')
      .select('*')
      .gte('draw_date', startOfYear)
      .lte('draw_date', endOfYear)
      .order('draw_date', { ascending: false });
    if (error) throw error;
    if (!data) throw new Error('No data');
    return data as RdlResult[];
  } catch {
    return readLocalResults()
      .filter((r) => r.draw_date >= startOfYear && r.draw_date <= endOfYear)
      .sort((a, b) => b.draw_date.localeCompare(a.draw_date));
  }
}

export async function getResultByDate(date: string): Promise<RdlResult | null> {
  try {
    const { data, error } = await supabase
      .from('rdl_results')
      .select('*')
      .eq('draw_date', date)
      .maybeSingle();
    if (error) throw error;
    return data as RdlResult | null;
  } catch {
    const rows = readLocalResults();
    return rows.find((r) => r.draw_date === date) ?? null;
  }
}

export async function getAllResults(): Promise<RdlResult[]> {
  try {
    const { data, error } = await supabase
      .from('rdl_results')
      .select('*')
      .order('draw_date', { ascending: false });
    if (error) throw error;
    if (!data) throw new Error('No data');
    return data as RdlResult[];
  } catch {
    return readLocalResults().sort((a, b) => b.draw_date.localeCompare(a.draw_date));
  }
}

/* ────────── Save functions (Supabase with localStorage fallback) ────────── */

export interface SaveLivePayload {
  slotKey: string;
  value: string;
  date?: string;
}

export async function saveLiveResult({ slotKey, value, date }: SaveLivePayload): Promise<void> {
  const slot = TIME_SLOTS.find((s) => s.key === slotKey);
  if (!slot) return;
  const slotName = slotNameFromShort(slot.short);
  const dbVal = value.trim() ? value.trim().padStart(2, '0') : 'WAIT';
  const targetDate = date ?? todayStr();

  try {
    const { data: existing, error: currentReadError } = await supabase
      .from('rdl_current_result')
      .select('id, result_value, previous_value')
      .eq('slot_name', slotName)
      .maybeSingle();
    if (currentReadError) throw currentReadError;

    const prevVal = existing?.result_value && existing.result_value !== 'WAIT'
      ? existing.result_value
      : existing?.previous_value ?? null;
    const currentPayload = {
      result_value: dbVal,
      previous_value: prevVal,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: currentUpdateError } = await supabase
        .from('rdl_current_result')
        .update(currentPayload)
        .eq('id', existing.id);
      if (currentUpdateError) throw currentUpdateError;
    } else {
      const { error: currentInsertError } = await supabase
        .from('rdl_current_result')
        .insert({ slot_name: slotName, ...currentPayload });
      if (currentInsertError) throw currentInsertError;
    }

    const { data: existingRow, error: rowReadError } = await supabase
      .from('rdl_results')
      .select('*')
      .eq('draw_date', targetDate)
      .maybeSingle();
    if (rowReadError) throw rowReadError;

    const updateFields: Record<string, string | null> = {
      [slotKey]: dbVal === 'WAIT' ? null : dbVal,
      updated_at: new Date().toISOString(),
    };

    if (existingRow) {
      const { error: rowUpdateError } = await supabase
        .from('rdl_results')
        .update(updateFields)
        .eq('id', existingRow.id);
      if (rowUpdateError) throw rowUpdateError;
    } else {
      const { error: rowInsertError } = await supabase
        .from('rdl_results')
        .insert({
          draw_date: targetDate,
          [slotKey]: dbVal === 'WAIT' ? null : dbVal,
        });
      if (rowInsertError) throw rowInsertError;
    }
  } catch {
    upsertLocalCurrent(slotName, dbVal, null);
    upsertLocalResult({ draw_date: targetDate, [slotKey]: dbVal === 'WAIT' ? null : dbVal });
  }

  window.dispatchEvent(new Event('rdl-storage-update'));
}

export async function saveDailyResult(date: string, values: Record<string, string>): Promise<void> {
  const slotData: Record<string, string | null> = {};
  for (const slot of TIME_SLOTS) {
    const v = values[slot.key]?.trim();
    slotData[slot.key] = v ? v.padStart(2, '0') : null;
  }

  let usedFallback = false;

  try {
    const { data: existingRow, error: rowReadError } = await supabase
      .from('rdl_results')
      .select('*')
      .eq('draw_date', date)
      .maybeSingle();
    if (rowReadError) throw rowReadError;

    const updateFields: Record<string, string | null> = {};
    const insertFields: Record<string, string | null> = { draw_date: date };
    for (const slot of TIME_SLOTS) {
      updateFields[slot.key] = slotData[slot.key];
      insertFields[slot.key] = slotData[slot.key];
    }
    updateFields['updated_at'] = new Date().toISOString();

    if (existingRow) {
      const { error: rowUpdateError } = await supabase
        .from('rdl_results')
        .update(updateFields)
        .eq('id', existingRow.id);
      if (rowUpdateError) throw rowUpdateError;
    } else {
      const { error: rowInsertError } = await supabase
        .from('rdl_results')
        .insert(insertFields);
      if (rowInsertError) throw rowInsertError;
    }

    if (date === todayStr()) {
      for (const slot of TIME_SLOTS) {
        const slotName = slotNameFromShort(slot.short);
        const val = values[slot.key]?.trim();
        const dbVal = val ? val.padStart(2, '0') : 'WAIT';

        const { data: existingCurrent, error: currentReadError } = await supabase
          .from('rdl_current_result')
          .select('id, result_value, previous_value')
          .eq('slot_name', slotName)
          .maybeSingle();
        if (currentReadError) throw currentReadError;

        const prevVal = existingCurrent?.result_value && existingCurrent.result_value !== 'WAIT'
          ? existingCurrent.result_value
          : existingCurrent?.previous_value ?? null;
        const currentPayload = {
          result_value: dbVal,
          previous_value: prevVal,
          updated_at: new Date().toISOString(),
        };

        if (existingCurrent) {
          const { error: currentUpdateError } = await supabase
            .from('rdl_current_result')
            .update(currentPayload)
            .eq('id', existingCurrent.id);
          if (currentUpdateError) throw currentUpdateError;
        } else {
          const { error: currentInsertError } = await supabase
            .from('rdl_current_result')
            .insert({ slot_name: slotName, ...currentPayload });
          if (currentInsertError) throw currentInsertError;
        }
      }
    }
  } catch {
    usedFallback = true;
    const row: Partial<RdlResult> & { draw_date: string } = { draw_date: date };
    for (const slot of TIME_SLOTS) {
      row[slot.key] = slotData[slot.key];
    }
    upsertLocalResult(row);

    if (date === todayStr()) {
      for (const slot of TIME_SLOTS) {
        const slotName = slotNameFromShort(slot.short);
        const val = values[slot.key]?.trim();
        const dbVal = val ? val.padStart(2, '0') : 'WAIT';
        upsertLocalCurrent(slotName, dbVal, null);
      }
    }
  }

  if (!usedFallback) {
    const row: Partial<RdlResult> & { draw_date: string } = { draw_date: date };
    for (const slot of TIME_SLOTS) {
      row[slot.key] = slotData[slot.key];
    }
    upsertLocalResult(row);
  }

  window.dispatchEvent(new Event('rdl-storage-update'));
}

function randomTwoDigit(): string {
  return String(Math.floor(Math.random() * 100)).padStart(2, '0');
}

export async function backfillMissingResults(days: number = 30): Promise<{ filled: number }> {
  let filled = 0;
  const today = new Date();

  for (let i = 1; i <= days; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = dateStr(d);

    let existing: RdlResult | null = null;

    try {
      const { data, error: rowReadError } = await supabase
        .from('rdl_results')
        .select('*')
        .eq('draw_date', dateKey)
        .maybeSingle();
      if (rowReadError) throw rowReadError;
      existing = data as RdlResult | null;
    } catch {
      const localRows = readLocalResults();
      existing = localRows.find((r) => r.draw_date === dateKey) ?? null;
    }

    const existingRow = existing as unknown as Record<string, string | null> | null;
    const slotKeys = TIME_SLOTS.map((s) => s.key);

    let hasBlanks = false;
    const updateFields: Record<string, string | null> = {};
    const insertFields: Record<string, string | null> = { draw_date: dateKey };

    for (const k of slotKeys) {
      const currentVal = existingRow?.[k] ?? null;
      if (!currentVal) {
        updateFields[k] = randomTwoDigit();
        insertFields[k] = updateFields[k];
        hasBlanks = true;
      }
    }

    if (hasBlanks) {
      updateFields['updated_at'] = new Date().toISOString();

      let savedToDb = false;
      try {
        if (existing) {
          const { error: rowUpdateError } = await supabase
            .from('rdl_results')
            .update(updateFields)
            .eq('id', existing.id);
          if (rowUpdateError) throw rowUpdateError;
        } else {
          const { error: rowInsertError } = await supabase
            .from('rdl_results')
            .insert(insertFields);
          if (rowInsertError) throw rowInsertError;
        }
        savedToDb = true;
      } catch {
        /* fall through to local */
      }

      if (!savedToDb) {
        const row: Partial<RdlResult> & { draw_date: string } = { draw_date: dateKey };
        for (const k of slotKeys) {
          if (updateFields[k]) row[k] = updateFields[k];
        }
        upsertLocalResult(row);
      }

      filled += 1;
    }
  }

  if (filled > 0) {
    window.dispatchEvent(new Event('rdl-storage-update'));
  }
  return { filled };
}
