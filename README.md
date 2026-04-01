# PawCare — Pet Care Assistant Platform

Full-stack demo: **React + Tailwind** (Vite), **Express**, **MongoDB** (Mongoose).

## Prerequisites

- Node.js 18+
- MongoDB running locally, or set `MONGODB_URI` to your cluster connection string.

## Setup

1. **Database** — start MongoDB (default URI: `mongodb://127.0.0.1:27017/petcare`).

2. **Server**

   ```bash
   cd server
   cp .env.example .env   # optional; defaults match local MongoDB
   npm install
   npm run dev
   ```

   API: `http://localhost:4000` — first boot seeds sample pets, vets, and reminders.

3. **Client**

   ```bash
   cd client
   npm install
   npm run dev
   ```

   App: `http://localhost:5173` (proxies `/api` to the server).

If `npm install` fails on OneDrive-synced folders, try moving the project to a non-synced path or run the terminal as Administrator.

## Routes (UI)

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/pets` | Pet list |
| `/pets/new` | Add pet |
| `/pets/:id` | Pet profile |
| `/vets` | Vet finder + map placeholder |
| `/appointments/book` | Book appointment |
| `/reminders` | Reminder panel |
| `/emergency` | Emergency help |
| `/profile` | User profile |
