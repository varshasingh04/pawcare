# PawCare Installation and Run Guide

This guide helps anyone run PawCare locally on Windows/macOS/Linux, push code to GitHub, and deploy on Vercel.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (local or Atlas)

## Prerequisites

- Node.js 18+ and npm
- Git
- MongoDB running locally, or a MongoDB Atlas connection string

Check versions:

```bash
node -v
npm -v
git --version
```

## 1) Clone Repository

```bash
git clone https://github.com/varshasingh04/pawcare.git
cd pawcare
```

If you already have the code as a folder, open terminal in that folder instead.

## 2) Configure Environment Variables (Server)

Go to server folder:

```bash
cd server
```

Create `.env` from `.env.example`.

### Windows (PowerShell)

```powershell
Copy-Item .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Default `.env` values:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/petcare
JWT_SECRET=use-a-long-random-string-in-production
```

If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas URI.

## 3) Install Dependencies

From project root, install for both apps:

```bash
cd server
npm install
cd ../client
npm install
```

## 4) Run in Development

Open two terminals.

### Terminal A (Backend)

```bash
cd server
npm run dev
```

Expected log:

`API http://localhost:4000`

### Terminal B (Frontend)

```bash
cd client
npm run dev
```

Expected log:

`Local: http://localhost:5173/` (or another port if 5173 is already in use)

Open the URL shown in terminal.

## 5) Demo Login

- Email: `john@example.com`
- Password: `password123`

These are seeded by backend when database is empty.

## 6) Production Build (Optional)

```bash
cd client
npm run build
npm run preview
```

## 7) Common Issues and Fixes

### Blank page / Vite import errors

- Stop frontend server.
- Reinstall dependencies:

```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Windows alternative for delete:

```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
```

### MongoDB connection error

- Ensure MongoDB service is running.
- Verify `MONGODB_URI` in `server/.env`.

### Port already in use

- Frontend may auto-switch to `5174` or next available port.
- Always open the exact URL shown by Vite terminal output.

## 8) Push to GitHub

If this is a fresh local folder:

```bash
git init
git add .
git commit -m "Initial PawCare project setup"
git branch -M main
git remote add origin https://github.com/varshasingh04/pawcare.git
git push -u origin main
```

If remote already exists:

```bash
git remote -v
git push
```

## 9) Deploy on Vercel (Recommended Setup)

This project is full-stack (`client` + `server`). The simplest reliable deployment is:

- Deploy `client` on Vercel
- Deploy `server` separately (Render/Railway/another Node host)
- Set frontend API base URL to your deployed backend URL

If you still want Vercel-only deployment, you need a Vercel-compatible serverless setup for backend routes.

### Deploy Frontend to Vercel with CLI

Install Vercel CLI:

```bash
npm install -g vercel
```

Deploy from `client` folder:

```bash
cd client
vercel
```

For production:

```bash
vercel --prod
```

When prompted:

- Link to existing project: choose as needed
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## 10) Useful Commands

Run backend:

```bash
cd server && npm run dev
```

Run frontend:

```bash
cd client && npm run dev
```

Install all quickly:

```bash
cd server && npm install
cd ../client && npm install
```

---

If you are onboarding a team, share this file directly as the single source of setup truth.

