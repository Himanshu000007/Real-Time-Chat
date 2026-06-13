import dns from "dns"

dns.setDefaultResultOrder("ipv4first")
dns.setServers(["8.8.8.8", "8.8.4.4"])

import express from "express"
import cookieParser from "cookie-parser"
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
import { isAllowedOrigin } from "./lib/cors.js"

const PORT = ENV.PORT || 3000

app.use(express.json({ limit: "5mb" }))

// Request logging
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get(
      "origin"
    )}`
  )
  next()
})

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
      } else {
        console.error("CORS Blocked for origin:", origin)
        callback(new Error("Not allowed by CORS"))
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
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
)

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    generateToken(req.user._id, res)
    res.redirect(ENV.CLIENT_URL)
  }
)

// Health Route
app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀")
})

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// ❌ REMOVE THIS BLOCK
// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")))
//
//   app.get("*", (_, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
//   })
// }

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT)
  connectDB()
})