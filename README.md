# PawCare - Pet Care Assistant

A comprehensive full-stack web application for pet owners to manage their pets' health, find veterinary services, and connect with the pet community.

## Live Demo

🌐 **Website**: [https://client-mu-orcin.vercel.app](https://client-mu-orcin.vercel.app)

🔗 **API**: [https://server-delta-nine-48.vercel.app](https://server-delta-nine-48.vercel.app)

---

## Features

### 🐾 Pet Management
- **Add & Manage Pets**: Register dogs, cats, and birds with detailed profiles
- **Pet Profiles**: Track name, breed, age, weight, gender, and reproductive status
- **QR Code Tags**: Generate unique QR codes for each pet - anyone who scans can see contact info
- **Edit & Delete**: Full control over pet information

### 💉 Health & Vaccination
- **Vaccination Records**: Track all vaccinations with proof upload (images/PDFs)
- **Auto Reminders**: Automatic reminders for upcoming vaccine doses
- **Vet-Verified Records**: Upload receipts/proof to prevent fraud

### 🔴 Lost & Found System
- **Mark Pet as Lost**: Report missing pets with last seen location
- **Lost Pet Poster**: Generate printable posters with QR code
- **Sighting Reports**: Anyone who spots the pet can report location
- **Real-time Alerts**: Get notified when someone reports a sighting

### 🩺 AI-Powered Tools
- **Symptom Checker**: Describe symptoms and get AI-powered health guidance
- **Nutrition Advisor**: Get personalized diet recommendations for your pet
- Powered by Groq AI (Llama 3.1)

### 🗺️ Map Features
- **Find Vets**: Interactive map showing nearby veterinary clinics
- **Help Map**: Community help posts on an interactive map
- **Post Help Requests**: Ask for help or offer assistance to other pet owners
- **Geolocation**: Auto-detect your location for accurate results

### 📅 Reminders & Appointments
- **Custom Reminders**: Set reminders for medications, grooming, walks, etc.
- **Book Appointments**: Schedule vet appointments with date/time selection
- **Dashboard View**: See upcoming reminders at a glance

### 🌙 Theme Support
- **Light & Dark Mode**: Toggle between themes for comfortable viewing
- **Persistent Preference**: Your theme choice is saved

### 📱 Heat Cycle Tracker
- Track heat cycles for female dogs and cats
- Get reminders for proper care during heat periods

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Leaflet | Interactive Maps |
| Lucide React | Icons |
| react-qr-code | QR Code Generation |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Groq SDK | AI Integration |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend & Backend Hosting |
| MongoDB Atlas | Cloud Database |

---

## API Documentation

### Base URL
```
https://server-delta-nine-48.vercel.app/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

#### Pets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pets` | Get all user's pets |
| POST | `/pets` | Add new pet |
| GET | `/pets/:id` | Get pet by ID |
| PUT | `/pets/:id` | Update pet |
| DELETE | `/pets/:id` | Delete pet |
| POST | `/pets/:id/heat-cycle` | Log heat cycle |

#### Vaccinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vaccinations/:petId` | Get pet's vaccinations |
| POST | `/vaccinations/:petId` | Add vaccination record |
| DELETE | `/vaccinations/:id` | Delete vaccination |

#### Lost Pets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lost-pets/:petId` | Get lost report |
| POST | `/lost-pets/:petId` | Mark pet as lost |
| PUT | `/lost-pets/:petId` | Update lost report |
| POST | `/lost-pets/:petId/found` | Mark pet as found |
| POST | `/lost-pets/:petId/sighting` | Report a sighting |

#### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reminders` | Get all reminders |
| POST | `/reminders` | Create reminder |
| PUT | `/reminders/:id` | Update reminder |
| PUT | `/reminders/:id/complete` | Mark complete |
| DELETE | `/reminders/:id` | Delete reminder |

#### Vets & Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vets` | Get nearby vets |
| POST | `/appointments` | Book appointment |

#### AI Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/symptom-checker` | Check symptoms |
| POST | `/ai/nutrition-advisor` | Get diet advice |

#### Help Posts (Community)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/help-posts` | Get all help posts |
| POST | `/help-posts` | Create help post |
| PUT | `/help-posts/:id/resolve` | Mark resolved |
| DELETE | `/help-posts/:id` | Delete post |

#### Public (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/pet/:shareToken` | Get pet info via QR scan |

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/varshasingh04/pawcare.git
cd pawcare
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/petcare
JWT_SECRET=your_secret_key_here
GROQ_API_KEY=your_groq_api_key
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

---

## Project Structure

```
pawcare/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api.js          # API client
│   │   ├── ThemeContext.jsx # Theme management
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Backend Node.js App
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── lib/            # Helper functions
│   │   ├── app.js          # Express app
│   │   └── db.js           # Database connection
│   ├── api/
│   │   └── index.js        # Vercel serverless entry
│   └── vercel.json
│
├── INSTALL.md              # Installation guide
├── PROJECT_OVERVIEW.md     # Detailed documentation
└── README.md               # This file
```

---

## Screenshots

### Dashboard (Light Mode)
The main dashboard shows pet overview, upcoming reminders, quick actions, and AI tools.

### Dashboard (Dark Mode)
Full dark mode support for comfortable viewing at night.

### Pet Profile
Detailed pet information with QR code, vaccination records, and lost pet controls.

### Vet Finder
Interactive map showing nearby veterinary clinics with ratings and booking.

---

## How to Use

### Getting Started
1. **Register/Login**: Create an account or login
2. **Add Your Pet**: Go to Pets → Add Pet and fill in details
3. **Explore Features**: Check out the dashboard for quick actions

### Managing Pets
1. Click on a pet card to view full profile
2. Add vaccination records with proof
3. Generate QR code for pet tag
4. Track heat cycles for female pets

### If Your Pet is Lost
1. Go to pet profile → Click "Mark as Lost"
2. Fill in last seen location and details
3. Generate and print the lost poster
4. Share the QR code - anyone who scans can report sightings

### Using AI Tools
1. **Symptom Checker**: Select pet, describe symptoms, get guidance
2. **Nutrition Advisor**: Enter pet details, get personalized diet plan

### Finding Vets
1. Go to Vets section
2. Allow location access for nearby results
3. View ratings, distance, and availability
4. Book appointments directly

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Contact

**Developer**: Varsha Singh

**GitHub**: [varshasingh04](https://github.com/varshasingh04)

**Project Link**: [https://github.com/varshasingh04/pawcare](https://github.com/varshasingh04/pawcare)

---

Made with ❤️ for pet lovers everywhere
