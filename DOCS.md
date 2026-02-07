# RealTime Chat – Documentation

## 1. Folder structure

```
RealTimeChat/
├── client/                    # React (Vite) frontend
│   ├── public/
│   ├── src/
│   │   ├── api/               # Axios instance + auth & messages API
│   │   ├── components/        # ProtectedRoute, ChatList, ChatWindow
│   │   ├── context/           # AuthContext, SocketContext
│   │   ├── pages/             # Signup, VerifyOTP, Login, Dashboard, Profile
│   │   ├── config.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # Node.js + Express backend
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── email.js            # Nodemailer OTP email
│   ├── controllers/
│   │   ├── authController.js  # signup, verifyOTP, login, getMe
│   │   └── messageController.js # getChats, getMessages, getUsers
│   ├── middleware/
│   │   ├── auth.js            # JWT protect
│   │   ├── validate.js        # Request validation
│   │   ├── errorHandler.js
│   │   └── rateLimitOTP.js
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── messageRoutes.js
│   ├── sockets/
│   │   └── index.js           # Socket.io auth + handlers
│   ├── utils/
│   │   ├── generateOTP.js
│   │   └── ApiError.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── DOCS.md
```

---

## 2. Backend code overview

| File | Purpose |
|------|--------|
| **server.js** | Creates Express app + HTTP server, mounts CORS, JSON, auth + message routes, error handler, and Socket.io. Starts server on `PORT`. |
| **config/db.js** | Connects to MongoDB using `MONGODB_URI`. |
| **config/email.js** | Nodemailer transporter and `sendOTPEmail(email, otp)` for 6-digit OTP. |
| **models/User.js** | Schema: name, email, password (hashed on save), isVerified, otp, otpExpires, profilePic, timestamps. `comparePassword` method. |
| **models/Message.js** | Schema: senderId, receiverId, content, status (sent/delivered/seen), timestamps. Indexes for chat queries. |
| **middleware/auth.js** | `protect`: reads Bearer token, verifies JWT, loads user, ensures `isVerified`. Attaches `req.user`. |
| **middleware/validate.js** | `validateSignup`, `validateVerifyOTP`, `validateLogin`, `validateSendMessage` – validate body and call `next(ApiError(400, ...))` on failure. |
| **middleware/errorHandler.js** | Sends JSON `{ success: false, message }` and optional stack in development. |
| **middleware/rateLimitOTP.js** | Rate limit: 5 OTP requests per 15 minutes per IP for `/verify-otp` and signup (when applied). |
| **controllers/authController.js** | **signup**: create/update unverified user, store hashed OTP + 5-min expiry, send OTP email. **verifyOTP**: verify OTP, set `isVerified`, clear OTP. **login**: require verified, compare password, return JWT + user. **getMe**: return current user. |
| **controllers/messageController.js** | **getChats**: aggregate last message per peer. **getMessages**: fetch conversation with one user, mark as seen. **getUsers**: list other verified users. |
| **sockets/index.js** | See “Socket logic” below. |

---

## 3. Frontend code overview

| File | Purpose |
|------|--------|
| **config.js** | `API_URL`, `SOCKET_URL` from `import.meta.env`. |
| **api/axios.js** | Axios instance with baseURL, Bearer token from localStorage, 401 → logout + redirect to `/login` (except on auth pages). |
| **api/auth.js** | `signup`, `verifyOTP`, `login`, `getMe`. |
| **api/messages.js** | `getChats`, `getMessages(receiverId)`, `getUsers`. |
| **context/AuthContext.jsx** | Holds `user`, `loading`, `loginUser`, `logout`. On load, if token exists calls `getMe` and sets user. |
| **context/SocketContext.jsx** | When user is set, connects Socket.io with `auth: { token }`. Listens `user_online`, `user_offline`, `online_list`. Exposes `socket`, `onlineUsers`, `isOnline(userId)`. |
| **components/ProtectedRoute.jsx** | If loading, shows spinner; if no user, redirects to `/login`; else renders children. |
| **components/ChatList.jsx** | Sidebar: Chats / New chat toggle, Profile link. Shows either user list (New chat) or chat list with last message and online indicator. |
| **components/ChatWindow.jsx** | Header (selected user + online), message list (scroll to bottom), mark seen via socket, input + Send. Emits `send_message`; listens `new_message`, `message_sent`, `messages_seen`. |
| **pages/Signup.jsx** | Form: name, email, password. Calls `signup` → navigate to `/verify-otp` with email in state. |
| **pages/VerifyOTP.jsx** | Reads email from location state. Form: 6-digit OTP. Calls `verifyOTP` → navigate to `/login` with verified state. |
| **pages/Login.jsx** | Form: email, password. Calls `login` → `loginUser(data.user, data.token)` → navigate to `/` or `from`. |
| **pages/Dashboard.jsx** | Fetches chats; when a user is selected fetches messages; subscribes socket to `new_message`, `message_sent`, `messages_seen`; passes props to ChatList and ChatWindow. |
| **pages/Profile.jsx** | Shows user name/email and Log out (logout + redirect to `/login`). |
| **App.jsx** | Routes: `/signup`, `/verify-otp`, `/login` (public); `/`, `/profile` (ProtectedRoute + SocketProvider). |

---

## 4. Socket logic explained

- **Connection & auth**  
  Client connects with `io(url, { auth: { token } })`. Server uses a middleware that reads `socket.handshake.auth.token` (or `Authorization` header), verifies JWT, loads user, and sets `socket.userId` and `socket.user`. If token is missing or invalid, connection is rejected.

- **User ↔ socket map**  
  Server keeps a `Map`: `userId → socket.id`. On **connection**, the server adds/updates this map (same user reconnecting replaces old socket). It emits **`online_list`** to the connecting socket with all other online user IDs so the client can show who is online. Then it **broadcasts `user_online`** (userId, name, email) so other clients can add this user to their online set.

- **Sending a message**  
  Client emits **`send_message`** with `{ receiverId, content }`. Server validates, creates a `Message` in MongoDB with status `sent`, then:
  - If the receiver is online, sends **`new_message`** to that socket and updates message status to `delivered`.
  - Sends **`message_sent`** back to the sender (with the saved message payload) so the sender’s UI can add the message and show it as sent.

- **Seen status**  
  When the receiver’s client has the chat open, it emits **`mark_seen`** with `{ messageIds, senderId }`. Server updates those messages to `seen` and emits **`messages_seen`** to the sender’s socket so the sender can update ticks.

- **Disconnect**  
  On **disconnect**, the server removes the user from the map and **broadcasts `user_offline`** with that userId so all clients remove them from the online set.

- **No duplicate sockets**  
  If the same user connects again (e.g. two tabs), the map stores only the latest `socket.id`. The old socket is not explicitly kicked; when it disconnects it will emit `user_offline`. So at any time each userId is mapped to at most one socket.

---

## 5. Auth & OTP flow explained

1. **Signup**  
   User submits name, email, password. Backend validates; if email already exists and is verified, returns error. If email exists but not verified, updates that user (name, password, new OTP). Otherwise creates a new user. In both cases: generate 6-digit OTP, hash it with bcrypt, set `otp` and `otpExpires = now + 5 min`, send OTP via Nodemailer. Response: success + email. **Account is not yet usable for login.**

2. **Verify OTP**  
   User submits email + OTP. Backend finds user by email, checks `otp` and `otpExpires`, compares OTP with bcrypt. If valid: set `isVerified = true`, clear `otp` and `otpExpires`. Response: success. **Signup is complete; user can now log in.**

3. **Login**  
   User submits email + password. Backend finds user (with password), checks `isVerified`. If not verified, returns 403. Otherwise compares password; if correct, issues JWT (payload: `{ id: user._id }`, expiry e.g. 7d) and returns token + user. Frontend stores token in localStorage and sets user in AuthContext.

4. **Protected routes**  
   Backend: `protect` middleware on `/api/messages/*` and `/auth/me` reads `Authorization: Bearer <token>`, verifies JWT, loads user, ensures `isVerified`, sets `req.user`. Frontend: `ProtectedRoute` checks AuthContext user; if none, redirects to `/login`.

5. **OTP rate limit**  
   `otpRateLimiter` on verify-otp (and optionally signup) limits requests per IP (e.g. 5 per 15 minutes) to prevent abuse.

---

## 6. Deployment instructions (Vercel + Render)

### Backend (Render)

1. Create a **Web Service** on Render. Connect your repo (or push this project).
2. **Build command:** `cd server && npm install`  
   **Start command:** `cd server && npm start`  
   (Or set root to `server` and use `npm install` / `npm start`.)
3. **Environment variables** (in Render dashboard):
   - `NODE_ENV=production`
   - `PORT` (Render sets this; keep it)
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = long random secret
   - `JWT_EXPIRE=7d`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (e.g. Gmail app password)
   - `FRONTEND_URL` = your Vercel app URL (e.g. `https://your-app.vercel.app`)
4. Deploy. Note the backend URL (e.g. `https://your-api.onrender.com`).

### MongoDB Atlas

1. Create a cluster, get connection string.
2. Replace `<password>` with the DB user password. Whitelist `0.0.0.0/0` for Render (or add Render IPs if you prefer).
3. Use this as `MONGODB_URI` on Render.

### Frontend (Vercel)

1. Create a new project on Vercel linked to your repo. Root directory: **client** (or project root; then set root to `client` in Vercel).
2. **Build command:** `npm run build`  
   **Output directory:** `dist`
3. **Environment variables:**
   - `VITE_API_URL` = backend URL (e.g. `https://your-api.onrender.com`)
   - `VITE_SOCKET_URL` = same backend URL (Socket.io is served from the same server)
4. Deploy. Update Render’s `FRONTEND_URL` to this Vercel URL so CORS and Socket.io allow the frontend origin.

### Post-deploy checks

- Backend: open `https://your-api.onrender.com/health` → should return `{ ok: true }`.
- Frontend: open the Vercel URL; signup → verify OTP → login; open two browsers (or incognito), log in as two users, and confirm real-time messaging and online status.

---

## 7. Common bugs & fixes

| Issue | Cause | Fix |
|-------|--------|-----|
| **CORS / Socket connection refused** | Backend not allowing frontend origin or wrong URL | Set `FRONTEND_URL` on backend to exact Vercel URL (no trailing slash). In production, ensure `cors` and Socket.io `cors.origin` use that URL. |
| **OTP email not received** | Wrong SMTP, app password, or spam | Use Gmail “App password” for `EMAIL_PASS`. Check spam. For local dev, use a real SMTP or a service like Mailtrap. |
| **“Please verify your email” on login** | User not verified or DB state wrong | Ensure verify-otp step completed. In DB, set `isVerified: true` for that user if needed. |
| **Messages not real-time** | Socket not connected or wrong event names | Ensure client passes `auth: { token }` and token is valid. Check browser console for Socket errors. Ensure server and client use same event names: `send_message`, `new_message`, `message_sent`, `mark_seen`, `messages_seen`. |
| **401 on API after login** | Token not sent or expired | Axios interceptor adds `Authorization: Bearer <token>`. Ensure token is stored in localStorage after login and that `getMe` and message APIs use the same axios instance. |
| **Duplicate messages in UI** | Same message added from both `message_sent` and `new_message` | When adding a message from socket events, check by `_id` that it’s not already in the list before appending. |
| **Online status wrong** | Stale online list or disconnect not handled | Server sends `online_list` on connect and `user_offline` on disconnect. Client should replace/update online set on `online_list` and remove user on `user_offline`. |
| **Render free tier sleeps** | First request after idle is slow | Normal for free tier. Consider a paid plan or a cron ping to keep the service awake. |

---

You now have a single place (this DOCS.md) for folder structure, backend/frontend overview, socket behavior, auth/OTP flow, deployment steps, and common issues.
