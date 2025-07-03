// Import required packages and modules
import express from 'express'
import authRoutes from './routes/auth.route.js'
import {connectDB} from "./lib/db.js";
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import messageRoutes from "./routes/message.route.js"
import cors from 'cors'
import {io} from './lib/socket.js'
import {app, server} from './lib/socket.js'

// Load environment variables from .env file
dotenv.config()

// Configure middleware
app.use(express.json({limit: '10mb'})) // Parse JSON request bodies with 10mb limit for image uploads
app.use(cookieParser()) // Parse cookies for authentication
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from frontend development server
    credentials: true, // Allow cookies to be sent with requests
}))

// Set up API routes
app.use("/api/auth", authRoutes) // Authentication routes (login, signup, etc.)
app.use("/api/messages", messageRoutes) // Message routes (send, receive messages)

// Store online users with a Map of userId -> socketId
const onlineUsers = new Map()

// Set up Socket.io connection handler
io.on('connection', (socket) => {
    console.log('A user connected', socket.id)

    // Handle user coming online
    socket.on('user-online', (userId) => {
        // Store the user's socket ID for direct messaging
        onlineUsers.set(userId, socket.id)
        // Broadcast the updated list of online users to all connected clients
        io.emit('online-users', Array.from(onlineUsers.keys()))
    })

    // Handle sending a new message
    socket.on('send-message', (message) => {
        // Get the socket ID of the message recipient
        const receiverSocketId = onlineUsers.get(message.receiverId)
        if (receiverSocketId) {
            // If recipient is online, send the message directly to their socket
            io.to(receiverSocketId).emit('receive-message', message)
        }
        // If recipient is offline, they'll get the message from the database when they reconnect
    })

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected', socket.id)
        // Find and remove the disconnected user from the online users map
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId)
                break
            }
        }
        // Broadcast the updated list of online users to all connected clients
        io.emit('online-users', Array.from(onlineUsers.keys()))
    })
})

// Set up server port from environment variables or use default
const PORT = process.env.PORT || 5006

// Start the HTTP server and connect to the database
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB() // Connect to MongoDB database
})
