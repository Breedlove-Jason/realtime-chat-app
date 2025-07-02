import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket, setupOnlineUsersListener } from "../lib/socket.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      // Connect socket if user is already authenticated
      if (res.data) {
        connectSocket(res.data._id);
      }
    } catch (e) {
      console.error("Error checking auth:", e);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      // Connect socket after successful signup
      connectSocket(res.data._id);
      toast.success("Account created successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error creating account");
      console.error(e);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      // Connect socket after successful login
      connectSocket(res.data._id);
      toast.success("Logged in successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error logging in");
      console.error(e);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      // Disconnect socket when logging out
      disconnectSocket();
      // Reset chat state
      const { resetState } = (await import('./useChatStore.js')).useChatStore.getState();
      resetState();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error logging out");
      console.error(e);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error updating profile");
      console.error(e);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Set online users received from socket
  setOnlineUsers: (onlineUsers) => {
    set({ onlineUsers });
  },
}));
