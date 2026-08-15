/*
# Add previous_value column to rdl_current_result

1. Changes
- Add `previous_value` (text, nullable) to `rdl_current_result` — stores the result number just before the latest one, so the UI can show "Current" vs "Previous" side by side.
- Backfill existing rows with sample previous values for demonstration.

2. Security
- No policy changes — table already allows anon + authenticated CRUD.
*/

ALTER TABLE rdl_current_result
  ADD COLUMN IF NOT EXISTS previous_value text;

-- Backfill previous values for the seeded rows
UPDATE rdl_current_result SET previous_value = '18' WHERE slot_name = 'RDLPRO 12 PM';
UPDATE rdl_current_result SET previous_value = '42' WHERE slot_name = 'RDLPRO 2 PM';
UPDATE rdl_current_result SET previous_value = '07' WHERE slot_name = 'RDLPRO 4 PM';
UPDATE rdl_current_result SET previous_value = '33' WHERE slot_name = 'RDLPRO 6 PM';
UPDATE rdl_current_result SET previous_value = '51' WHERE slot_name = 'RDLPRO 8 PM';
UPDATE rdl_current_result SET previous_value = '29' WHERE slot_name = 'RDLPRO 10 PM';