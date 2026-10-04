CREATE TABLE public.demo_profiles (
  device_id text PRIMARY KEY CHECK (char_length(device_id) BETWEEN 16 AND 64),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.demo_profiles TO service_role;
ALTER TABLE public.demo_profiles ENABLE ROW LEVEL SECURITY;
-- No client policies: accessed only through server functions with the service role.