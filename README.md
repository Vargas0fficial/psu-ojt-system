# PSU OJT Monitoring System

Full-stack web app for monitoring OJT/intern attendance for Pangasinan State
University — interns log their time in/out, supervisors track hours rendered.

## Stack

- **Next.js 16** (App Router, TypeScript) — frontend + API routes
- **MongoDB** (official `mongodb` driver) — works with MongoDB Atlas or a
  local MongoDB instance
- **JWT session cookie** (`jsonwebtoken`) + `bcryptjs` for auth
- **Tailwind CSS v4** for styling

Collections and indexes are created automatically on first request (see
`src/lib/db.ts`) — no manual migration step needed, just point
`MONGODB_URI` at an empty database.

## Setup

1. **Get a MongoDB database.** Easiest option:
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) — free
     M0 tier, always-on (no auto-suspend/cold-start delays), takes a
     couple minutes to set up. In Atlas: create a free cluster → Database
     Access (create a user) → Network Access (allow your IP, or `0.0.0.0/0`
     for development) → Connect → Drivers → copy the connection string.
   - Or run MongoDB locally (`mongod` / Docker) if you prefer.

2. **Copy `.env.example` to `.env`** and fill in the two values:
```bash
   cp .env.example .env
```