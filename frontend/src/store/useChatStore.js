import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';
const merge = (a, b) => [...new Map([...a, ...b].map(m => [m._id, m])).values()].sort((x,y) => x._id.localeCompare(y._id));
export const useChatStore = create((set, get) => ({
 messages: [], users: [], selectedUser: null, unread: {}, typingUntil: {},
 areUsersLoading: false, areMessagesLoading: false, hasOlder: false, loadingOlder: false,
 reset: () => set({ messages: [], users: [], selectedUser: null, unread: {}, typingUntil: {}, hasOlder: false }),
 getUsers: async () => {
  set({ areUsersLoading: true });
  try { const { data } = await axiosInstance.get('/messages/users'); set({ users: data }); }
  catch { toast.error('Unable to load contacts. Try refreshing.'); }
  finally { set({ areUsersLoading: false }); }
 },
 getMessages: async id => {
  set({ areMessagesLoading: true });
  try {
   const { data } = await axiosInstance.get(`/messages/${id}`);
   if (get().selectedUser?._id === id) set(s => ({ messages: merge(data, s.messages), hasOlder: data.length === 50 }));
  } catch { toast.error('Unable to load conversation'); }
  finally { if (get().selectedUser?._id === id) set({ areMessagesLoading: false }); }
 },
 loadOlder: async () => {
  const { selectedUser, messages, loadingOlder } = get();
  if (!selectedUser || !messages.length || loadingOlder) return;
  set({ loadingOlder: true });
  try {
   const { data } = await axiosInstance.get(`/messages/${selectedUser._id}?before=${messages[0]._id}`);
   if (get().selectedUser?._id === selectedUser._id) set(s => ({ messages: merge(data, s.messages), hasOlder: data.length === 50 }));
  } catch { toast.error('Unable to load older messages'); }
  finally { set({ loadingOlder: false }); }
 },
 sendMessage: async messageData => {
  const id = get().selectedUser?._id;
  if (!id) return false;
  try {
   const { data } = await axiosInstance.post(`/messages/send/${id}`, messageData);
   if (get().selectedUser?._id === id) set(s => ({ messages: merge(s.messages, [data]) }));
   return true;
  } catch (error) { toast.error(error.response?.data?.message || 'Message not sent. Your draft is preserved.'); return false; }
 },
 receive: message => {
  const me = useAuthStore.getState().authUser?._id;
  const peer = message.senderId === me ? message.receiverId : message.senderId;
  if (get().selectedUser?._id === peer) set(s => ({ messages: merge(s.messages, [message]) }));
  else if (message.senderId !== me) set(s => ({ unread: { ...s.unread, [peer]: (s.unread[peer] || 0) + 1 } }));
 },
 setSelectedUser: selectedUser => set(s => ({ selectedUser, messages: [], hasOlder: false, unread: { ...s.unread, [selectedUser?._id]: 0 } })),
}));
