import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios.js';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  areUsersLoading: false,
  areMessagesLoading: false,

  getUsers: async () => {
    set({ areUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users: res.data });
      // toast.success('Users loaded successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load users');
      console.error(e);
    } finally {
      set({ areUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ areMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // toast.success('Messages loaded successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load messages');
      console.error(e);
    } finally {
      set({ areMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}, messageData`,
      );
      set({ messages: [...messages, res.data] });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send message');
      console.error(e);
    }
  },

  // TODO: optimize later
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
