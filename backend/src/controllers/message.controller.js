import { User } from "../models/user.model.js";
import {Message} from "../models/message.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const filteredUser = await User.find({
      _id: { $ne: loggedInUser._id },
    }).select("-password");
    res.status(200).json(filteredUser);
  } catch (e) {
    console.error("Error in getUsersForSidebar", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const senderId = req.user._id;
    const messages = await Message.find({
        $or: [
            { senderId:senderId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: senderId }
        ]
    })
      res.status(200).json(messages);
  } catch (e) {
    console.error("Error in getMessages", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
