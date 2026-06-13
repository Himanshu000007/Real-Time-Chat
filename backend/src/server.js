import dns from "dns"

dns.setDefaultResultOrder("ipv4first")
dns.setServers(["8.8.8.8", "8.8.4.4"])

import express from "express"
import cookieParser from "cookie-parser"
import path from "path"
import cors from "cors"
import passport from "passport"
import session from "express-session"

import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import "./lib/googleAuth.js"
import { connectDB } from "./lib/db.js"
import { ENV } from "./lib/env.js"
import { app, server } from "./lib/socket.js"
import { generateToken } from "./lib/utils.js"

const __dirname = path.resolve()

const PORT = ENV.PORT || 3000

app.use(express.json({ limit: "5mb" }))

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get("origin")}`);
  next();
});

// Sanitize CLIENT_URL (remove trailing slash)
const clientUrl = ENV.CLIENT_URL?.endsWith("/") ? ENV.CLIENT_URL.slice(0, -1) : ENV.CLIENT_URL;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow if origin is the configured CLIENT_URL, localhost, or if there's no origin (like server-to-server)
      if (!origin || origin === clientUrl || origin.includes("localhost") || origin.includes("vercel.app")) {
        callback(null, true);
      } else {
        console.error("CORS Blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
)
app.use(cookieParser())

app.use(
  session({
    secret: ENV.JWT_SECRET,
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    generateToken(req.user._id, res)
    res.redirect(ENV.CLIENT_URL)
  }
)

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
  })
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT)
  connectDB()
})