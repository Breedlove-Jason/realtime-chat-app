import jwt from 'jsonwebtoken';
import { cookieOptions } from './config.js';
export const generateToken = (userId, res) => {
 const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
 res.cookie('jwt', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
 return token;
};
