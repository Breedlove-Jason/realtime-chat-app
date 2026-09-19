import { Server } from 'socket.io';
import http from 'node:http';
import express from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { User } from '../models/user.model.js';
import { origins } from './config.js';
export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
 cors: { origin: origins, credentials: true },
 maxHttpBufferSize: 16384,
 allowRequest: (req, callback) => callback(null, !req.headers.origin || origins.includes(req.headers.origin)),
});
io.use(async (socket, next) => {
 try {
  const token = cookie.parse(socket.request.headers.cookie || '').jwt;
  const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  if (!await User.exists({ _id: claims.userId })) return next(new Error('Unauthorized'));
  socket.data.userId = String(claims.userId);
  socket.data.expiresAt = claims.exp * 1000;
  next();
 } catch { next(new Error('Unauthorized')); }
});
const presence = new Map();
io.on('connection', socket => {
 const id = socket.data.userId;
 socket.join(id);
 presence.set(id, (presence.get(id) || 0) + 1);
 io.emit('getOnlineUsers', [...presence.keys()]);
 const expiry = setTimeout(() => socket.disconnect(true), Math.max(0, socket.data.expiresAt - Date.now()));
 let lastTyping = 0;
 socket.on('typing', payload => {
  if (Date.now() - lastTyping < 500 || !/^[a-f0-9]{24}$/.test(payload?.receiverId || '')) return;
  lastTyping = Date.now();
  socket.to(payload.receiverId).emit('typing', { userId: id });
 });
 socket.on('disconnect', () => {
  clearTimeout(expiry);
  const count = (presence.get(id) || 1) - 1;
  if (count) presence.set(id, count); else presence.delete(id);
  io.emit('getOnlineUsers', [...presence.keys()]);
 });
});
