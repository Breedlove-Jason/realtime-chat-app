import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

/**
 * Connects to MongoDB using the connection string from environment variables
 * Exits the process if connection fails
 */
export const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err)
        process.exit(1) // Exit the process with failure
    }
}
