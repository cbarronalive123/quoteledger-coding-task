# Frontend — Next.js + shadcn/ui + Tailwind

Single-page insurance items UI that talks to the Django API.

## Setup

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

App: http://localhost:3000

Make sure the backend is running (default `NEXT_PUBLIC_API_URL=http://localhost:8000`).

## Features

- List items (search + group filter)
- Create item (company dropdown + add new)
- View item details
- Edit / delete from the table Actions column
- Auto-generated reference codes (read-only in UI)

## Theme

Black → near-black blue gradient background, white/grey text, grey borders.
