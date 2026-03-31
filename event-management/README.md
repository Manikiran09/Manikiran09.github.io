# EventHub — MERN Event Participation Management & Registration System

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Manikiran09/Manikiran09.github.io?quickstart=1)

A full-featured, production-ready **Event Participation Management and Registration System** built with the **MERN Stack** (MongoDB, Express.js, React, Node.js).

---

## ✨ Features

### 👥 User Roles
| Role | Capabilities |
|------|-------------|
| **User / Attendee** | Browse events, register, cancel, view history, manage profile |
| **Organizer** | All user features + create/edit/delete events, view participants, check-in |
| **Admin** | All organizer features + manage all users, view system-wide stats |

### 🎪 Event Management
- Create events with rich details: title, description, category, venue (physical/online), date/time, capacity, fee
- Support for 10 categories: Conference, Workshop, Seminar, Hackathon, Cultural, Sports, Networking, Webinar, Exhibition, Other
- Agenda builder — sessions with time, speaker, description
- Speaker profiles
- Custom registration fields (text, number, email, dropdown)
- Event status management (draft / published / cancelled / completed)
- Full-text search + filter by category, city, price, date

### 📋 Registration Management
- One-click event registration
- Unique auto-generated registration IDs (e.g. `EVT-M1K2J3-AB12C`)
- Registration status: pending / confirmed / attended / cancelled / waitlisted
- Re-registration support (after cancellation)
- Real-time capacity tracking with visual progress bars
- Registration deadline enforcement
- Check-in system for organizers

### 📊 Dashboards
- **User Dashboard**: All registrations with status filter, cancel option, event links
- **Admin/Organizer Dashboard**: Live stats, event management table, participant list, check-in

---

## 🗂️ Project Structure

```
event-management/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt passwords)
│   │   ├── Event.js            # Event schema (virtual slots)
│   │   └── Registration.js     # Registration schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── registrationController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── registrations.js
│   ├── middleware/
│   │   └── auth.js             # JWT protect + role authorize
│   ├── server.js               # Express app entry point
│   ├── seed.js                 # Demo data seeder
│   └── .env.example
│
└── frontend/                   # React + Vite
    └── src/
        ├── components/
        │   ├── Navbar.jsx       # Responsive nav with role-based links
        │   ├── EventCard.jsx    # Event card with capacity bar
        │   ├── Spinner.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Home.jsx         # Event listing with search & filters
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── EventDetails.jsx # Full event page + register/cancel
        │   ├── Dashboard.jsx    # User's registrations
        │   ├── AdminDashboard.jsx # Organizer/Admin panel
        │   ├── EventForm.jsx    # Create/Edit event form
        │   └── Profile.jsx     # Profile + password change
        ├── context/
        │   └── AuthContext.jsx  # JWT-based auth state
        └── utils/
            └── api.js          # Axios instance with interceptors
```

---

## 🚀 Quick Start

### ▶ Open in GitHub Codespaces (Recommended)

Click the badge above or go to **Code → Codespaces → Create codespace on this branch**. The Codespace will automatically:

1. Install Node.js 20 + MongoDB
2. Run `npm install` for both backend and frontend
3. Create `backend/.env` with a generated JWT secret
4. Seed the database with demo accounts and 6 sample events

Once ready, open **two terminals** inside the Codespace:

```bash
# Terminal 1 — Backend (port 5000)
cd event-management/backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd event-management/frontend && npm run dev
```

Codespaces will automatically forward port **5173** and open a preview browser tab.

> **Demo accounts** (password: `password123`):
> - `admin@demo.com` — Admin
> - `organizer@demo.com` — Organizer
> - `user@demo.com` — Attendee

---

### 💻 Local Development

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone & Install

```bash
# Backend
cd event-management/backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventmanagement
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Data (Optional)

```bash
cd backend
node seed.js
```

This creates:
- `admin@demo.com` / `password123` — Admin
- `organizer@demo.com` / `password123` — Organizer (6 sample events)
- `user@demo.com` / `password123` — Regular user

### 4. Run

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | User | Get current user |
| PUT | `/api/auth/profile` | User | Update profile |
| PUT | `/api/auth/change-password` | User | Change password |
| GET | `/api/auth/users` | Admin | List all users |
| PUT | `/api/auth/users/:id/toggle` | Admin | Activate/deactivate |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | Optional | List/search events |
| GET | `/api/events/:id` | — | Get event details |
| POST | `/api/events` | Organizer+ | Create event |
| PUT | `/api/events/:id` | Organizer+ | Update event |
| DELETE | `/api/events/:id` | Organizer+ | Delete event |
| GET | `/api/events/my-events` | Organizer+ | Own events |
| GET | `/api/events/stats` | Organizer+ | Dashboard stats |
| GET | `/api/events/:id/participants` | Organizer+ | Participant list |
| PUT | `/api/events/:id/checkin/:regId` | Organizer+ | Check-in participant |

### Registrations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/registrations` | User | Register for event |
| GET | `/api/registrations/my` | User | My registrations |
| GET | `/api/registrations/:id` | User | Single registration |
| PUT | `/api/registrations/:id/cancel` | User | Cancel registration |
| GET | `/api/registrations` | Admin+ | All registrations |
| PUT | `/api/registrations/:id/status` | Organizer+ | Update status |

---

## 🔐 Security
- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** tokens (configurable expiry, default 7 days)
- Route-level authorization middleware (`protect` + `authorize`)
- Input validation with **express-validator**
- CORS restricted to frontend origin

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State | React Context API + localStorage |
| HTTP Client | Axios (with interceptors) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| UI Icons | react-icons |
| Date Utils | date-fns |
| Notifications | react-hot-toast |

---

## 📈 Production Deployment

### Backend (e.g. Render, Railway, Heroku)
1. Set environment variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Deploy from the `event-management/backend` directory

### Frontend (e.g. Vercel, Netlify)
1. Update `vite.config.js` proxy OR set `VITE_API_URL` env var
2. Deploy from `event-management/frontend`
3. Add redirect rule for SPA: `/* → /index.html`

---

## 📝 License
MIT
