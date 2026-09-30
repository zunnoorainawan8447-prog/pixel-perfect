CREATE TABLE public.ai_rate_limits (
  key_hash text NOT NULL,
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key_hash, bucket, window_start)
);
GRANT ALL ON public.ai_rate_limits TO service_role;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_ai_rate_limit(p_key text, p_per_minute int, p_per_day int)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m int; d int;
BEGIN
  INSERT INTO ai_rate_limits AS r (key_hash, bucket, window_start, count)
  VALUES (p_key, 'minute', date_trunc('minute', now()), 1)
  ON CONFLICT (key_hash, bucket, window_start) DO UPDATE SET count = r.count + 1
  RETURNING count INTO m;
  INSERT INTO ai_rate_limits AS r (key_hash, bucket, window_start, count)
  VALUES (p_key, 'day', date_trunc('day', now()), 1)
  ON CONFLICT (key_hash, bucket, window_start) DO UPDATE SET count = r.count + 1
  RETURNING count INTO d;
  IF random() < 0.02 THEN
    DELETE FROM ai_rate_limits WHERE window_start < now() - interval '2 days';
  END IF;
  IF m > p_per_minute THEN RETURN 'minute'; END IF;
  IF d > p_per_day THEN RETURN 'day'; END IF;
  RETURN 'ok';
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_rate_limit(text, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_rate_limit(text, int, int) TO service_role;