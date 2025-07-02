import express from 'express'
import authRoutes from './routes/auth.route.js'
import {connectDB} from "./lib/db.js";
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import messageRoutes from "./routes/message.route.js"
import cors from 'cors'
import {io} from './lib/socket.js'
import {app, server} from './lib/socket.js'
dotenv.config()

app.use(express.json({limit: '10mb'}))
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow cookies to be sent with requests
}))
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// Store online users
const onlineUsers = new Map()

io.on('connection', (socket) => {
    console.log('A user connected', socket.id)

    // Handle user connection
    socket.on('user-online', (userId) => {
        onlineUsers.set(userId, socket.id)
        // Broadcast online users to all connected clients
        io.emit('online-users', Array.from(onlineUsers.keys()))
    })

    // Handle new message
    socket.on('send-message', (message) => {
        const receiverSocketId = onlineUsers.get(message.receiverId)
        if (receiverSocketId) {
            // Send message to specific user
            io.to(receiverSocketId).emit('receive-message', message)
        }
    })

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected', socket.id)
        // Find and remove the disconnected user
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId)
                break
            }
        }
        // Broadcast updated online users
        io.emit('online-users', Array.from(onlineUsers.keys()))
    })
})

const PORT = process.env.PORT || 5006
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})
