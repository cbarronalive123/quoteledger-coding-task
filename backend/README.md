# Backend — Django REST API

Insurance items API for the coding task.

## Setup

```powershell
# from repo root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
copy .env.example .env
```

Set `DATABASE_URL` in `.env` (see root README / `db/README.md`), then:

```powershell
python manage.py migrate
python manage.py seed_items --reset   # optional
python manage.py runserver
```

Or see [`start.md`](start.md).

API base: http://127.0.0.1:8000/

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/items/` | List items |
| `POST` | `/items/` | Create item |
| `GET` | `/items/{id}/` | Get item |
| `PATCH` | `/items/{id}/` | Update item |
| `DELETE` | `/items/{id}/` | Delete item |

## Example create body

`reference_code` is assigned by the server (do not send it).

```json
{
  "name": "Aviva Direct",
  "group": "auto",
  "annual_price": "5848.01",
  "monthly_price": "210.07"
}
```

`group` values: `auto`, `home`, `life`, `commercial`, `specialty`, `nonstandard_auto`, `collector`, `travel`, `disability`, `residual`

Names must be unique within a group. Annual/monthly prices must be unique across the database and must differ from each other.

## Database

PostgreSQL database `insurance`. Schema via Django migrations. Setup: [`../db/README.md`](../db/README.md).
