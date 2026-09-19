import { User } from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/cloudinary.js';
import { io } from '../lib/socket.js';
import { validId, validateImage } from '../lib/validation.js';
export const getUsersForSidebar = async (req, res) => {
 const users = await User.find({ _id: { $ne: req.user._id } }).select('_id fullName profilePic').sort({ fullName: 1 }).limit(200);
 res.json(users);
};
export const getMessages = async (req, res) => {
 if (!validId(req.params.id) || (req.query.before && !validId(req.query.before))) return res.status(400).json({ message: 'Invalid conversation' });
 const filter = { $or: [{ senderId: req.user._id, receiverId: req.params.id }, { senderId: req.params.id, receiverId: req.user._id }] };
 if (req.query.before) filter._id = { $lt: req.query.before };
 const messages = await Message.find(filter).sort({ _id: -1 }).limit(50);
 res.json(messages.reverse());
};
export const sendMessage = async (req, res) => {
 const receiverId = req.params.id;
 const { text, image } = req.body || {};
 if (!validId(receiverId) || String(req.user._id) === receiverId || (text !== undefined && typeof text !== 'string') || (text?.length || 0) > 4000 || (!text?.trim() && !image) || (image && !validateImage(image))) return res.status(400).json({ message: 'Use a message up to 4,000 characters or a JPEG, PNG, or WebP image up to 2 MB' });
 if (!await User.exists({ _id: receiverId })) return res.status(404).json({ message: 'Recipient not found' });
 let imageUrl;
 if (image) {
  if (!process.env.CLOUDINARY_API_KEY) return res.status(503).json({ message: 'Image uploads are not configured yet' });
  const uploaded = await cloudinary.uploader.upload(image, { folder: 'relay/messages' });
  imageUrl = uploaded.secure_url;
 }
 const message = await Message.create({ senderId: req.user._id, receiverId, text: text?.trim(), image: imageUrl });
 io.to(receiverId).to(String(req.user._id)).emit('newMessage', message);
 res.status(201).json(message);
};
