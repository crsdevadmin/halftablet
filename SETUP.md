# DrMed — Phase 2 Setup (Windows)

One-time setup to run the app with a real PostgreSQL database, login, and orders.

## 1. Install PostgreSQL

1. Download the installer from https://www.postgresql.org/download/windows/ (version 16 is fine)
2. Run it. Remember the **password** you set for the `postgres` user. Keep port `5432`.
3. When it finishes, open **SQL Shell (psql)** from the Start menu, press Enter through the prompts, type your password, then create the database:

```sql
CREATE DATABASE drmed;
```

## 2. Configure environment

In the project folder (`Downloads\drmed`), create **two** files:

**`.env`** (Prisma reads this one):
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/drmed
```

**`.env.local`** (Next.js reads this one — copy from `.env.local.example`):
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/drmed
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-long-random-string-for-dev
```

Replace `YOUR_PASSWORD` with the password from step 1.

## 3. Install dependencies & set up the database

Open a terminal in the project folder:

```bash
npm install
npx prisma migrate dev --name init   # creates tables
npx prisma db seed                   # loads medicines, batches, demo users
```

## 4. Run

```bash
npm run dev
```

## 5. Try the full flow

1. Add medicines to cart → checkout → fill address → **Place Order**
2. You'll be asked to sign in: enter any 10-digit number → the OTP prints in your **terminal** (dev mode)
3. Order is created in Postgres, stock decremented batch-by-batch (soonest expiry first)
4. Browse data anytime with `npm run db:studio`

Demo staff accounts (sign in with these phone numbers): `9000000001` (admin), `9000000002` (pharmacist).

## Troubleshooting

- **"Can't reach database server"** — PostgreSQL service isn't running: Start menu → Services → postgresql-x64-16 → Start
- **Prisma errors after schema changes** — run `npx prisma migrate dev` again
- **OTP not appearing** — check the terminal running `npm run dev`, not the browser console

## What's still mock

The admin dashboard (`/admin`) still reads mock data — wiring it to these tables is the next step, so you can verify orders placed in the store show up in the pipeline.
