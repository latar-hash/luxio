# Luxio Kanban

Aplikasi web Kanban mirip Trello dibuat dengan Next.js, Prisma + SQLite, dan integrasi Google Calendar.

## Fitur
- Board, column, dan task
- Due date & time untuk setiap task
- Google Calendar OAuth dan sinkronisasi event
- Backend Prisma dengan SQLite

## Setup

1. Install dependensi:
   ```bash
   npm install
   ```

2. Salin file environment:
   ```bash
   cp .env.example .env
   ```

3. Isi variabel Google OAuth di `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` -> `http://localhost:3000/api/google/callback`

4. Generate Prisma client dan push schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

6. Buka `http://localhost:3000` di browser.

## Catatan Google Calendar

- Klik tombol `Hubungkan Google Calendar` untuk memulai OAuth.
- Setelah login, tutup jendela dan refresh halaman.
- Setelah task memiliki tanggal dan jam, gunakan tombol `Sinkron Calendar` pada task tersebut.
