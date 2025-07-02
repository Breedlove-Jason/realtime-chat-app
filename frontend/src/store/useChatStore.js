import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios.js';
import { sendMessageSocket, setupMessageListener } from '../lib/socket.js';
import { useAuthStore } from './useAuthStore.js';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  areUsersLoading: false,
  areMessagesLoading: false,

  // Initialize socket message listener
  initializeMessageListener: () => {
    setupMessageListener((message) => {
      const { messages, selectedUser } = get();
      // Only add the message if it's from the currently selected conversation
      if (selectedUser && 
          (message.senderId === selectedUser._id || message.receiverId === selectedUser._id)) {
        set({ messages: [...messages, message] });
      }
    });
  },

  // Reset state when user logs out
  resetState: () => {
    set({
      messages: [],
      users: [],
      selectedUser: null,
    });
  },

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
        `/messages/send/${selectedUser._id}`, messageData,
      );
      set({ messages: [...messages, res.data] });

      // Send message via socket for real-time delivery
      const { authUser } = useAuthStore.getState();
      sendMessageSocket({
        ...res.data,
        senderId: authUser._id,
        receiverId: selectedUser._id
      });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send message');
      console.error(e);
    }
  },

  // TODO: optimize later
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
