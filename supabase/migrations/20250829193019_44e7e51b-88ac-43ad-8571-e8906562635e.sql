-- Update drone_recordings table to use TEXT for base64 data instead of BYTEA
ALTER TABLE public.drone_recordings 
ALTER COLUMN recording_data TYPE TEXT;