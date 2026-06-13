import axios from "axios";
import { API_URL } from "../config/api";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 60000, // 60 seconds (better for Render cold starts)
});

// Add request/response interceptors for better debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);
