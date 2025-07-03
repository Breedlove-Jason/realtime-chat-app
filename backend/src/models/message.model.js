import mongoose from "mongoose";

/**
 * Message Schema
 * Defines the structure for message documents in the database
 */
const messageSchema = new mongoose.Schema(
  {
    // ID of the user who sent the message
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    // ID of the user who receives the message
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    // Text content of the message (optional if image is provided)
    text: {
      type: String,
    },
    // URL to the image attachment (optional)
    image: {
      type: String,
    },
  },
  // Automatically add createdAt and updatedAt timestamps
  { timestamps: true },
);

// Create the Message model from the schema
const Message = mongoose.model("Message", messageSchema);
export default Message;
