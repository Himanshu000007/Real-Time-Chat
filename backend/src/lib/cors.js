import { ENV } from "./env.js";

const normalizeOrigin = (origin) => origin?.replace(/\/$/, "");

export const clientUrl = normalizeOrigin(ENV.CLIENT_URL);

export const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(normalizeOrigin(origin))) return true;

  return origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("vercel.app");
};
