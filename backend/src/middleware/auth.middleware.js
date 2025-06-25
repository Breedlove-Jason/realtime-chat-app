import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

export const protectRoute = async (req, res, next) => {
  try {
      // console.log('Protect Route Middleware - Checking JWT Token');

    if (!req.cookies || !req.cookies.jwt) {
      return res
        .status(401)
        .json({ message: 'No valid token provided, please login first.' });
    }
    const token = req.cookies.jwt;
    if (!token || typeof token !== 'string') {
      return res
        .status(401)
        .json({ message: 'No valid token provided, please login first.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    let user;
    try {
      user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
      console.error('Database query error:', error.message);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next(); // go to next function in the middleware stack
  } catch (e) {
    console.error('Error in protectRoute middleware: ', e.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
