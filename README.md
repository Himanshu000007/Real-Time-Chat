# RealTime Chat – WhatsApp-like Messaging Platform

A full-stack MERN real-time chat app with email OTP verification, JWT auth, and Socket.io.

## Quick start (local)

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, and email (EMAIL_USER, EMAIL_PASS, etc.)
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd client
cp .env.example .env
# For local dev you can leave .env empty (Vite proxy will use backend at :5000)
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### 3. Use the app

1. Open http://localhost:5173
2. Sign up (name, email, password) → check email for 6-digit OTP
3. Verify OTP → then log in
4. Open another browser/incognito, sign up a second user and verify
5. From the first user click "New chat", select the second user, and send messages in real time

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, Axios, Socket.io-client, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, Nodemailer, bcrypt

## Docs

See **[DOCS.md](./DOCS.md)** for:

- Folder structure
- Backend & frontend overview
- Socket.io logic
- Auth & OTP flow
- Deployment (Vercel + Render)
- Common bugs and fixes

## Environment variables

**Server (`server/.env`):**

- `PORT` – default 5000
- `MONGODB_URI` – MongoDB Atlas connection string
- `JWT_SECRET` – secret for signing JWTs
- `JWT_EXPIRE` – e.g. `7d`
- `EMAIL_*` – SMTP (e.g. Gmail app password)
- `FRONTEND_URL` – frontend origin for CORS/socket (e.g. `http://localhost:5173` in dev)

**Client (`client/.env`):**

- `VITE_API_URL` – backend URL (empty in dev if using Vite proxy)
- `VITE_SOCKET_URL` – same as backend URL for Socket.io
