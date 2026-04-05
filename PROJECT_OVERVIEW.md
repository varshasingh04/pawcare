# PawCare Project Overview (Presentation Guide)

## 1) Project Summary

**PawCare** is a full-stack pet care web application that helps pet owners:

- manage pet profiles
- track reminders and vaccinations
- find nearby vets/emergency clinics
- book appointments
- share a public pet profile via secure QR/share token

The project uses a React frontend and Node/Express backend with MongoDB.

---

## 2) Core Features

- Authentication (register, login, logout, profile fetch)
- Pet management (add pet, view pet list, view pet details)
- Reminder dashboard (upcoming reminders)
- Vet finder (search + emergency list)
- Appointment booking
- Public pet scan page (`/pet/scan/:shareToken`) for emergency contact visibility
- Map-based help/services page (`/help-map`)

---

## 3) Tech Stack

### Frontend

- **React 18** (component-based UI)
- **Vite** (fast dev server + build tool)
- **Tailwind CSS** (utility-first styling)
- **React Router DOM** (routing/navigation)
- **React Leaflet + Leaflet** (interactive map)
- **Leaflet MarkerCluster** (marker clustering)
- **Lucide React** (icons)

### Backend

- **Node.js** + **Express**
- **Mongoose** (MongoDB ODM)
- **JWT** via `jsonwebtoken` (auth token)
- **bcryptjs** (password hashing)
- **dotenv** (environment variables)
- **cors** (cross-origin support)

### Database

- **MongoDB** (local for development + Atlas for cloud production)

### Deployment

- **Vercel Frontend**: `https://client-mu-orcin.vercel.app`
- **Vercel Backend**: `https://server-delta-nine-48.vercel.app`

---

## 4) High-Level Architecture

1. User interacts with React UI.
2. Frontend calls backend REST APIs (`/api/...`).
3. Backend validates JWT and business logic.
4. Mongoose reads/writes data in MongoDB.
5. Response is returned as JSON and rendered in UI.

---

## 5) API Documentation

Base URL (Production): `https://server-delta-nine-48.vercel.app`

### Health

#### `GET /api/health`
- Purpose: Service health check.
- Auth: No
- Response:
```json
{ "ok": true }
```

### Auth APIs

#### `POST /api/auth/register`
- Purpose: Register new user.
- Auth: No
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "phone": "+91XXXXXXXXXX"
}
```
- Success: `201`
```json
{
  "token": "jwt-token",
  "user": { "id": "...", "email": "user@example.com", "name": "User Name", "phone": "+91..." }
}
```

#### `POST /api/auth/login`
- Purpose: Login existing user.
- Auth: No
- Body:
```json
{ "email": "john@example.com", "password": "password123" }
```
- Success: `200`
```json
{
  "token": "jwt-token",
  "user": { "id": "...", "email": "john@example.com", "name": "John", "phone": "+1 555 0199" }
}
```

#### `POST /api/auth/logout`
- Purpose: Stateless logout endpoint.
- Auth: No
- Success: `204` (no body)

#### `GET /api/auth/me`
- Purpose: Get currently logged-in user profile.
- Auth: **Yes** (`Authorization: Bearer <token>`)
- Success: `200`
```json
{ "id": "...", "email": "john@example.com", "name": "John", "phone": "+1 555 0199" }
```

### Pet APIs (Protected)

#### `GET /api/pets`
- Purpose: Get all pets owned by current user.
- Auth: Yes

#### `GET /api/pets/:id`
- Purpose: Get single pet by id (owner scoped).
- Auth: Yes

#### `POST /api/pets`
- Purpose: Create a new pet profile.
- Auth: Yes
- Body:
```json
{
  "name": "Luna",
  "type": "Dog",
  "age": 3,
  "weight": 12.5,
  "breed": "Golden Retriever"
}
```
- Success: `201` with created pet JSON.

### Reminder APIs (Protected)

#### `GET /api/reminders`
- Purpose: Get upcoming reminders for current user.
- Auth: Yes

### Vet APIs

#### `GET /api/vets`
- Purpose: Get vets list sorted by rating.
- Auth: No
- Query (optional): `q` (search by name/address)

Example:
`GET /api/vets?q=harbor`

#### `GET /api/vets/emergency`
- Purpose: Get only emergency vets sorted by nearest distance.
- Auth: No

### Appointment APIs (Protected)

#### `POST /api/appointments`
- Purpose: Create appointment.
- Auth: Yes
- Body:
```json
{
  "date": "2026-04-05",
  "time": "10:30 AM",
  "vetName": "BrightPaws Animal Hospital"
}
```
- Success: `201` with created appointment JSON.

### Public Pet API

#### `GET /api/public/pet/:shareToken`
- Purpose: Public QR/tag endpoint for pet + owner contact details.
- Auth: No
- Returns limited public-safe data only.

---

## 6) Frontend Routes (UI)

- `/` - Dashboard
- `/login` - Login
- `/register` - Register
- `/logout` - Logout
- `/pets` - Pets hub
- `/pets/new` - Add pet
- `/pets/:id` - Pet profile
- `/vets` - Vet finder
- `/appointments/book` - Book appointment
- `/reminders` - Reminders
- `/emergency` - Emergency
- `/profile` - User profile
- `/help-map` - Map-based pet help & services
- `/pet/scan/:shareToken` - Public pet scan page

---

## 7) Project Tree Map (Concise)

```text
majr-prj-1/
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ AppLayout.jsx
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ ProtectedAppLayout.jsx
│  │  │  └─ MapBasedPetHelp.jsx
│  │  ├─ pages/
│  │  │  ├─ Dashboard.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Register.jsx
│  │  │  ├─ PetsHub.jsx
│  │  │  ├─ PetProfile.jsx
│  │  │  ├─ AddPet.jsx
│  │  │  ├─ VetFinder.jsx
│  │  │  ├─ BookAppointment.jsx
│  │  │  ├─ Reminders.jsx
│  │  │  ├─ Emergency.jsx
│  │  │  ├─ UserProfile.jsx
│  │  │  ├─ PetScan.jsx
│  │  │  └─ PetHelpMap.jsx
│  │  ├─ validation/
│  │  ├─ App.jsx
│  │  ├─ api.js
│  │  ├─ AuthContext.jsx
│  │  ├─ main.jsx
│  │  └─ index.css
│  ├─ package.json
│  └─ vite.config.js
├─ server/
│  ├─ api/
│  │  └─ index.js
│  ├─ scripts/
│  │  └─ migrateLocalToAtlas.js
│  ├─ src/
│  │  ├─ lib/
│  │  │  └─ shareToken.js
│  │  ├─ middleware/
│  │  │  └─ auth.js
│  │  ├─ models/
│  │  │  ├─ User.js
│  │  │  ├─ Pet.js
│  │  │  ├─ Reminder.js
│  │  │  ├─ Vet.js
│  │  │  └─ Appointment.js
│  │  ├─ routes/
│  │  │  ├─ auth.js
│  │  │  ├─ pets.js
│  │  │  ├─ reminders.js
│  │  │  ├─ vets.js
│  │  │  ├─ appointments.js
│  │  │  └─ publicPet.js
│  │  ├─ app.js
│  │  ├─ db.js
│  │  ├─ index.js
│  │  └─ seed.js
│  ├─ .env.example
│  ├─ package.json
│  └─ vercel.json
├─ README.md
├─ INSTALL.md
└─ PROJECT_OVERVIEW.md
```

---

## 8) Environment Variables

### Server (`server/.env`)

- `PORT=4000`
- `MONGODB_URI=<mongodb connection string>`
- `JWT_SECRET=<secret string>`

### Client (Vercel Production)

- `VITE_API_BASE_URL=https://server-delta-nine-48.vercel.app`

---

## 9) Demo Credentials

- Email: `john@example.com`
- Password: `password123`

---

## 10) Presentation Talking Points

- Why this project matters: combines pet care, reminders, emergency access, and community help in one platform.
- Technical depth: full-stack auth, protected APIs, MongoDB modeling, and map feature integration.
- Deployment readiness: frontend + backend on Vercel, cloud DB migration completed.
- Real-world extension: notifications, role-based access, payment for appointments, and geospatial analytics.

