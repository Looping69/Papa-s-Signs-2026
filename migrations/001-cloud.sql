CREATE SCHEMA IF NOT EXISTS papas;
CREATE TABLE IF NOT EXISTS papas.config (id integer PRIMARY KEY CHECK (id=1), value jsonb NOT NULL, revision integer NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS papas.admin (id integer PRIMARY KEY CHECK (id=1), salt text, hash text, bootstrap_hash text, bootstrap_expires timestamptz, CHECK ((salt IS NULL) = (hash IS NULL)));
CREATE TABLE IF NOT EXISTS papas.sessions (token_hash text PRIMARY KEY, credential text NOT NULL, expires timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON papas.sessions(expires);
CREATE TABLE IF NOT EXISTS papas.limits (key text PRIMARY KEY, count integer NOT NULL, expires timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS limits_expiry ON papas.limits(expires);
