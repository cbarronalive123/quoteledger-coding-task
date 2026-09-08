# QuoteLedger — Django API + React (Next.js) Coding Task

Full-stack take-home: a Django REST API for insurance **items** and a separate Next.js frontend that lists, creates, views, updates, and deletes them.

Backend and frontend live in one repo but **run as independent apps**.

---

## Repository layout

```text
backend/          Django + DRF API
frontend/         Next.js + shadcn/ui + Tailwind SPA
db/               Postgres setup notes + optional Docker Compose
coding_task.md    Original assignment brief
```

Interview prep under `notes/` is **not** part of the submission tree (gitignored).

---

## Prerequisites

- Python 3.10+ (3.12 recommended)
- Node.js 18+ (20+ recommended)
- PostgreSQL 16+ **or** Docker (for the database)

---

## 1. Database setup (PostgreSQL)

The API expects a Postgres database named `insurance`.

### Option A — Local Postgres

1. Install and start PostgreSQL.
2. Create the database (PowerShell example):

```powershell
$env:PGPASSWORD="YOUR_PASSWORD"
psql -U postgres -d postgres -c "CREATE DATABASE insurance OWNER postgres;"
```

3. Connection URL shape:

```text
postgresql://postgres:YOUR_PASSWORD@localhost:5432/insurance
```

### Option B — Docker Compose (from `db/`)

```powershell
cd db
docker compose up -d
```

This starts Postgres on host port **5433** with:

| Setting  | Value        |
|----------|--------------|
| Database | `insurance`  |
| User     | `codingtask` |
| Password | `codingtask` |
| URL      | `postgresql://codingtask:codingtask@localhost:5433/insurance` |

Schema is applied by **Django migrations** (not by mounting SQL). After the container is healthy, run migrations from `backend/` (below).

More detail: [`db/README.md`](db/README.md).

---

## 2. Backend (Django API)

```powershell
# from repo root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your Postgres URL.

```powershell
python manage.py migrate
python manage.py seed_items --reset   # optional demo data (~75 rows)
python manage.py runserver
```

Quick start helper: [`backend/start.md`](backend/start.md)

- API: http://127.0.0.1:8000/
- Items: http://127.0.0.1:8000/items/

| Method | Path | Description |
|--------|------|-------------|
| GET | `/items/` | List items |
| POST | `/items/` | Create item |
| GET | `/items/{id}/` | Retrieve item |
| PATCH | `/items/{id}/` | Partial update |
| DELETE | `/items/{id}/` | Delete item |

**Rules enforced:** unique company `name` per `group`; auto-generated unique `reference_code`; unique annual/monthly prices; distinct created/updated timestamps. Invalid input → **400**; missing id → **404**; create → **201**.

More detail: [`backend/README.md`](backend/README.md).

---

## 3. Frontend (Next.js)

In a **second** terminal:

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

App: http://localhost:3000  

Ensure `NEXT_PUBLIC_API_URL` points at the API (default `http://localhost:8000`).

More detail: [`frontend/README.md`](frontend/README.md).

---

## Submission checklist (from `coding_task.md`)

| Requirement | Status |
|-------------|--------|
| Code in a Git repository with access | This repo |
| Working Django API + local setup instructions | `backend/` + this README |
| React app that talks to the API | `frontend/` |
| Backend and frontend runnable separately | Yes |
| Root `README.md` with setup instructions | This file |

---

## Notes for reviewers

- Domain flavor is Canadian insurance product groups (Auto, Home, Life, …). Uniqueness follows the assignment pattern (unique names **within** a group).
- Seed premiums are **demo values only**, not live carrier quotes.
- Do not commit real `.env` files; use `.env.example` templates.
