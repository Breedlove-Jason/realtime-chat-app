import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

import { io } from 'socket.io-client';

const BASE_URL = window.location.origin;
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  connectionStatus: 'offline',

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log('Error in checkAuth:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      set({ authUser: res.data });
      toast.success('Account created successfully');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Connection failed. Please try again.');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    if (get().isLoggingIn) return;
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      set({ authUser: res.data });
      toast.success('Logged in successfully');

      get().connectSocket();
    } catch (error) {
      return { error: error.response?.status === 429
        ? 'Too many sign-in attempts. Please wait 15 minutes before trying again.'
        : error.response?.data?.message || 'Connection failed. Please try again.' };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Connection failed. Please try again.');
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.log('error in update profile:', error);
      toast.error(error.response?.data?.message || 'Connection failed. Please try again.');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });
    socket.connect();

    set({ socket: socket });

    socket.on('connect', () => set({ connectionStatus: 'connected' }));
    socket.on('disconnect', () => set({ connectionStatus: 'reconnecting', onlineUsers: [] }));
    socket.on('connect_error', () => set({ connectionStatus: 'reconnecting' }));
    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: [], connectionStatus: 'offline' });
  },
}));

