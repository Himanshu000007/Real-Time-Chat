import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { BASE_URL } from "../config/api";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingOTP: false,
  isResendingOTP: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    console.log("Checking auth at:", BASE_URL);
    // Force timeout after 60 seconds (for Render cold starts)
    const timeout = setTimeout(() => {
      console.warn("Auth check timed out. Proceeding as unauthenticated.");
      set({ isCheckingAuth: false, authUser: null });
    }, 60000);

    try {
      const res = await axiosInstance.get("/auth/check");
      console.log("Auth check success:", res.data ? "User found" : "No user");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      clearTimeout(timeout);
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data, navigate) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  googleLogin: async (credential) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/google-login", { credential });
      set({ authUser: res.data });
      toast.success("Logged in successfully with Google");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },

  verifyOTP: async (data) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      set({ authUser: res.data });
      toast.success("Email verified successfully!");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      return false;
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  resendOTP: async (email) => {
    set({ isResendingOTP: true });
    try {
      await axiosInstance.post("/auth/resend-otp", { email });
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      set({ isResendingOTP: false });
    }
  },

  requestLoginOTP: async (email, navigate) => {
    set({ isResendingOTP: true });
    try {
      await axiosInstance.post("/auth/request-login-otp", { email });
      toast.success("Login OTP sent to your email!");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send login OTP");
    } finally {
      set({ isResendingOTP: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
