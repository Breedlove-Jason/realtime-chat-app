import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';

/**
 * Chat Store using Zustand
 * 
 * Manages all chat-related state and operations including:
 * - Messages between users
 * - List of users to chat with
 * - Currently selected user
 * - Loading states
 * - API operations for messages
 * - Socket.io subscriptions for real-time updates
 */
export const useChatStore = create((set, get) => ({
  // State
  messages: [],          // List of messages with the selected user
  users: [],             // List of users to chat with
  selectedUser: null,    // Currently selected user for conversation
  areUsersLoading: false,  // Loading state for users list
  areMessagesLoading: false, // Loading state for messages

  /**
   * Fetches the list of users the current user can chat with
   * Updates the users state and handles loading state
   */
  getUsers: async () => {
    set({ areUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users: res.data });
    } catch (e) {
      toast.error(e.response.data.message || 'Failed to load users');
      console.error(e);
    } finally {
      set({ areUsersLoading: false });
    }
  },

  /**
   * Fetches message history between the current user and the specified user
   * @param {string} userId - ID of the user to get messages with
   */
  getMessages: async (userId) => {
    set({ areMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (e) {
      toast.error(e.response.data.message || 'Failed to load messages');
      console.error(e);
    } finally {
      set({ areMessagesLoading: false });
    }
  },

  /**
   * Sends a new message to the selected user
   * @param {Object} messageData - Message data (text and/or image)
   */
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      // Add the new message to the messages array
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  /**
   * Sets up Socket.io listener for real-time message updates
   * Only listens for messages from the currently selected user
   */
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    // Get socket from auth store
    const socket = useAuthStore.getState().socket;

    // Listen for new messages
    socket.on('newMessage', (newMessage) => {
      // Only process messages from the selected user
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // Add the new message to the messages array
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  /**
   * Removes Socket.io listener to prevent memory leaks
   * Called when component unmounts or user changes
   */
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off('newMessage');
  },

  /**
   * Sets the currently selected user for conversation
   * @param {Object} selectedUser - User object to set as selected
   */
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
