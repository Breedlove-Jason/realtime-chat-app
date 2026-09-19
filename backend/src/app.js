import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { app } from './lib/socket.js';
import { origins } from './lib/config.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'], connectSrc: ["'self'", ...origins, ...origins.map(x => x.replace(/^http/, 'ws'))] } } }));
app.use(cors({ origin: origins, credentials: true }));
app.use((req, res, next) => {
 if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin && !origins.includes(req.headers.origin)) return res.status(403).json({ message: 'Origin not allowed' });
 next();
});
app.use('/api', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
const authLimit = rateLimit({ windowMs: 15 * 60000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many attempts. Try again in 15 minutes.' } });
app.use('/api/auth/login', authLimit);
app.use('/api/auth/signup', authLimit);
app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable' }));
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));
const frontend = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
if (process.env.NODE_ENV === 'production') {
 app.use(express.static(frontend));
 app.get('/{*path}', (req, res) => res.sendFile(path.join(frontend, 'index.html')));
}
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
 const status = err.status === 413 ? 413 : err.type === 'entity.parse.failed' ? 400 : 500;
 res.status(status).json({ message: status === 413 ? 'Upload is too large' : status === 400 ? 'Invalid request' : 'Service unavailable. Please try again.' });
});
export default app;
