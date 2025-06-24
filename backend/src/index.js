import express from 'express'
import authRoutes from './routes/auth.route.js'
import {connectDB} from "./lib/db.js";
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import messageRoutes from "./routes/message.route.js"

const app = express()
dotenv.config()

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)

const PORT = process.env.PORT || 5006
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})