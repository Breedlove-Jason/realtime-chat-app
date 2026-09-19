import { generateToken } from '../lib/utils.js';
import { cookieOptions } from '../lib/config.js';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';
import { io } from '../lib/socket.js';
import { validateImage } from '../lib/validation.js';
const publicUser = u => ({ _id: u._id, fullName: u.fullName, email: u.email, profilePic: u.profilePic, createdAt: u.createdAt });
function credentials(body) {
 const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
 const password = body?.password;
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password) > 72) return null;
 return { email, password };
}
export const signup = async (req, res) => {
 const data = credentials(req.body);
 const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';
 if (!data || fullName.length < 2 || fullName.length > 60) return res.status(400).json({ message: 'Use a valid email, a 2–60 character name, and a password of 6–72 bytes.' });
 try {
  const user = await User.create({ ...data, fullName, password: await bcrypt.hash(data.password, 12) });
  generateToken(user._id, res);
  io.emit('contactsChanged');
  res.status(201).json(publicUser(user));
 } catch (error) { res.status(error.code === 11000 ? 409 : 500).json({ message: error.code === 11000 ? 'Email already registered. Please log in.' : 'Could not create account' }); }
};
export const login = async (req, res) => {
 const data = credentials(req.body);
 if (!data) return res.status(400).json({ message: 'Invalid email or password' });
 try {
  const user = await User.findOne({ email: data.email });
  if (!user || !await bcrypt.compare(data.password, user.password)) return res.status(401).json({ message: 'Invalid email or password' });
  generateToken(user._id, res);
  res.json(publicUser(user));
 } catch { res.status(500).json({ message: 'Unable to log in' }); }
};
export const logout = (req, res) => {
 if (req.user) io.in(String(req.user._id)).disconnectSockets(true);
 res.clearCookie('jwt', cookieOptions).json({ message: 'Logged out' });
};
export const updateProfile = async (req, res) => {
 try {
  const { profilePic } = req.body || {};
  if (!validateImage(profilePic)) return res.status(400).json({ message: 'Use a JPEG, PNG, or WebP image up to 2 MB' });
  if (!process.env.CLOUDINARY_API_KEY) return res.status(503).json({ message: 'Image uploads are not configured yet' });
  const upload = await cloudinary.uploader.upload(profilePic, { folder: 'relay/avatars', transformation: [{ width: 256, height: 256, crop: 'fill' }] });
  const user = await User.findByIdAndUpdate(req.user._id, { profilePic: upload.secure_url }, { new: true });
  res.json(publicUser(user));
 } catch { res.status(500).json({ message: 'Could not update profile' }); }
};
export const checkAuth = (req, res) => res.json(publicUser(req.user));
