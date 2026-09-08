-- Insurance items catalog / quote registry
-- Matches coding_task.md + agreed extras (prices, reference code)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_group') THEN
        CREATE TYPE item_group AS ENUM (
            'auto',
            'home',
            'life',
            'commercial',
            'specialty',
            'nonstandard_auto',
            'collector',
            'travel',
            'disability',
            'residual'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS items (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    "group"         item_group NOT NULL,
    annual_price    NUMERIC(12, 2),
    monthly_price   NUMERIC(12, 2),
    reference_code  VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT items_name_group_uniq UNIQUE (name, "group"),
    CONSTRAINT items_reference_code_uniq UNIQUE (reference_code),
    CONSTRAINT items_annual_price_nonneg CHECK (annual_price IS NULL OR annual_price >= 0),
    CONSTRAINT items_monthly_price_nonneg CHECK (monthly_price IS NULL OR monthly_price >= 0)
);

CREATE INDEX IF NOT EXISTS items_group_idx ON items ("group");
CREATE INDEX IF NOT EXISTS items_name_idx ON items (name);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS items_set_updated_at ON items;
CREATE TRIGGER items_set_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
