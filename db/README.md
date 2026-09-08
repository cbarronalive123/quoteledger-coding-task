# Local Postgres for QuoteLedger

Django migrations own the live schema. Use this folder to stand up Postgres and point `DATABASE_URL` at it.

## Option A — Local PostgreSQL 16+

1. Start Postgres.
2. Create DB:

```powershell
$env:PGPASSWORD="YOUR_PASSWORD"
psql -U postgres -d postgres -c "CREATE DATABASE insurance OWNER postgres;"
```

3. Set in `backend/.env`:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/insurance
```

4. From `backend/`:

```powershell
python manage.py migrate
python manage.py seed_items --reset
```

## Option B — Docker Compose

```powershell
cd db
docker compose up -d
```

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `insurance` |
| User | `codingtask` |
| Password | `codingtask` |

```text
DATABASE_URL=postgresql://codingtask:codingtask@localhost:5433/insurance
```

Then run Django `migrate` (and optional `seed_items`) from `backend/`.

### Stop / reset Docker DB

```powershell
docker compose down
docker compose down -v   # wipe volume
docker compose up -d
```

## Schema (`items`)

Applied by Django (`backend/items/migrations/`). Important constraints:

- Unique `(name, group)`
- Unique `reference_code`, `annual_price`, `monthly_price`, `created_at`, `updated_at`
- `annual_price` ≠ `monthly_price`
- `created_at` ≠ `updated_at`

`init.sql` is a historical reference only — prefer migrations for the live database.
