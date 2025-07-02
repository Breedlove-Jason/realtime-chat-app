import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  areUsersLoading: false,
  areMessagesLoading: false,

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
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      // toast.success('Users loaded successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load users");
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
      toast.error(e.response?.data?.message || "Failed to load messages");
      console.error(e);
    } finally {
      set({ areMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });

      // Send message via socket for real-time delivery
      const { authUser } = useAuthStore.getState();
      sendMessageSocket({
        ...res.data,
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send message");
      console.error(e);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
