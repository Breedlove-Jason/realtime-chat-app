import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore.js';

// Create a socket instance that connects to the backend
const socket = io('http://localhost:5006', {
  autoConnect: false, // Don't connect automatically, we'll connect when user logs in
  withCredentials: true,
});

// Function to connect socket when user logs in
export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    // Emit user-online event when connected
    socket.emit('user-online', userId);

    // Set up online users listener
    const { setOnlineUsers } = useAuthStore.getState();
    setupOnlineUsersListener(setOnlineUsers);
  }
};

// Function to disconnect socket when user logs out
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Function to send a message via socket
export const sendMessageSocket = (message) => {
  if (socket.connected) {
    socket.emit('send-message', message);
  }
};

// Function to set up message listener
export const setupMessageListener = (callback) => {
  socket.on('receive-message', (message) => {
    callback(message);
  });
};

// Function to set up online users listener
export const setupOnlineUsersListener = (callback) => {
  socket.on('online-users', (onlineUsers) => {
    callback(onlineUsers);
  });
};

export default socket;
