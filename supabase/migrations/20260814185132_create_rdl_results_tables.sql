/*
# Create RDL Pro Matka results tables

1. New Tables
- `rdl_results` — stores daily draw results for 6 time slots (12PM, 2PM, 4PM, 6PM, 8PM, 10PM)
  - `id` (uuid, primary key)
  - `draw_date` (date, not null) — the date of the draws
  - `slot_12pm` (text, nullable) — result for 12PM slot, null means "not yet drawn"
  - `slot_2pm` (text, nullable) — result for 2PM slot
  - `slot_4pm` (text, nullable) — result for 4PM slot
  - `slot_6pm` (text, nullable) — result for 6PM slot
  - `slot_8pm` (text, nullable) — result for 8PM slot
  - `slot_10pm` (text, nullable) — result for 10PM slot
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)
- `rdl_current_result` — stores the "live" current result shown in the hero card
  - `id` (uuid, primary key)
  - `slot_name` (text, not null) — e.g. "RDLPRO 12 PM"
  - `result_value` (text, not null) — e.g. "25" or "WAIT"
  - `updated_at` (timestamptz, default now)

2. Security
- Enable RLS on both tables.
- This is a no-auth public site, so allow anon + authenticated full CRUD (data is intentionally public/shared).

3. Notes
- Unique constraint on `rdl_results.draw_date` so each day has exactly one row.
- Unique constraint on `rdl_current_result.slot_name`.
- Index on draw_date for fast lookups.
*/

CREATE TABLE IF NOT EXISTS rdl_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date date NOT NULL,
  slot_12pm text,
  slot_2pm text,
  slot_4pm text,
  slot_6pm text,
  slot_8pm text,
  slot_10pm text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT rdl_results_draw_date_unique UNIQUE (draw_date)
);

CREATE INDEX IF NOT EXISTS idx_rdl_results_draw_date ON rdl_results (draw_date);

CREATE TABLE IF NOT EXISTS rdl_current_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_name text NOT NULL UNIQUE,
  result_value text NOT NULL DEFAULT 'WAIT',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rdl_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdl_current_result ENABLE ROW LEVEL SECURITY;

-- rdl_results policies (public, no-auth app)
DROP POLICY IF EXISTS "anon_select_rdl_results" ON rdl_results;
CREATE POLICY "anon_select_rdl_results" ON rdl_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rdl_results" ON rdl_results;
CREATE POLICY "anon_insert_rdl_results" ON rdl_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rdl_results" ON rdl_results;
CREATE POLICY "anon_update_rdl_results" ON rdl_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rdl_results" ON rdl_results;
CREATE POLICY "anon_delete_rdl_results" ON rdl_results FOR DELETE
  TO anon, authenticated USING (true);

-- rdl_current_result policies (public, no-auth app)
DROP POLICY IF EXISTS "anon_select_rdl_current" ON rdl_current_result;
CREATE POLICY "anon_select_rdl_current" ON rdl_current_result FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rdl_current" ON rdl_current_result;
CREATE POLICY "anon_insert_rdl_current" ON rdl_current_result FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rdl_current" ON rdl_current_result;
CREATE POLICY "anon_update_rdl_current" ON rdl_current_result FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rdl_current" ON rdl_current_result;
CREATE POLICY "anon_delete_rdl_current" ON rdl_current_result FOR DELETE
  TO anon, authenticated USING (true);

-- Seed current result rows for the 6 slots
INSERT INTO rdl_current_result (slot_name, result_value) VALUES
  ('RDLPRO 12 PM', 'WAIT'),
  ('RDLPRO 2 PM', '25'),
  ('RDLPRO 4 PM', 'WAIT'),
  ('RDLPRO 6 PM', 'WAIT'),
  ('RDLPRO 8 PM', 'WAIT'),
  ('RDLPRO 10 PM', 'WAIT')
ON CONFLICT (slot_name) DO NOTHING;

-- Seed today's results row
INSERT INTO rdl_results (draw_date, slot_2pm) VALUES
  (CURRENT_DATE, '25')
ON CONFLICT (draw_date) DO NOTHING;