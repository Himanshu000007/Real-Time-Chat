const DEV_BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001";

export const BASE_URL =
  import.meta.env.MODE === "development"
    ? DEV_BASE_URL
    : "https://real-time-chat-sbjq.onrender.com";

export const API_URL = `${BASE_URL}/api`;