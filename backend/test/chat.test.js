import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { io as client } from 'socket.io-client';
process.env.JWT_SECRET = 'test-secret-only-32-characters-long-enough';
process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/app.js');
const { server, io } = await import('../src/lib/socket.js');
let db, base;
const sockets = [];
before(async () => { db = await MongoMemoryServer.create(); await mongoose.connect(db.getUri()); await new Promise(r => server.listen(0, '127.0.0.1', r)); base = `http://127.0.0.1:${server.address().port}`; });
after(async () => { sockets.forEach(s => s.disconnect()); await new Promise(r => io.close(r)); await mongoose.disconnect(); await db?.stop(); });
const signup = async (name) => { const res = await request(app).post('/api/auth/signup').send({ fullName: name, email: `${name}@example.com`, password: 'test-password-42' }); assert.equal(res.status, 201); assert.ok(res.body._id); assert.equal(res.body.password, undefined); return { user: res.body, cookie: res.headers['set-cookie'][0].split(';')[0] }; };
function socket(cookie) { const s = client(base, { extraHeaders: cookie ? { Cookie: cookie } : {}, reconnection: false, autoConnect: false }); sockets.push(s); return s; }
function event(s, name) { return new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error(`Missing ${name}`)), 5000); s.once(name, value => { clearTimeout(t); resolve(value); }); }); }
test('authentication, private history, socket identity, typing, persistence, validation and logout', async () => {
 const a = await signup('Alice'); const b = await signup('Bob'); const c = await signup('Carol');
 const login = await request(app).post('/api/auth/login').send({ email: 'ALICE@example.com', password: 'test-password-42' });
 assert.equal(login.body._id, a.user._id);
 assert.equal((await request(app).get('/api/messages/users')).status, 401);
 const people = await request(app).get('/api/messages/users').set('Cookie', a.cookie);
 assert.equal(people.body[0].email, undefined);
 assert.equal((await request(app).post(`/api/messages/send/${b.user._id}`).set('Cookie', a.cookie).set('Origin','https://evil.example').send({ text: 'x' })).status, 403);
 const bad = socket(); const rejected = event(bad, 'connect_error'); bad.connect(); assert.equal((await rejected).message, 'Unauthorized');
 const bob = socket(b.cookie); const connected = event(bob, 'connect'); bob.connect(); await connected;
 const alice = socket(a.cookie); const ready = event(alice, 'connect'); alice.connect(); await ready;
 const typing = event(bob, 'typing'); alice.emit('typing', { receiverId: b.user._id, userId: c.user._id }); assert.equal((await typing).userId, a.user._id);
 const incoming = event(bob, 'newMessage');
 const sent = await request(app).post(`/api/messages/send/${b.user._id}`).set('Cookie', a.cookie).send({ text: 'Hello Bob', senderId: c.user._id });
 assert.equal(sent.status, 201); assert.equal(sent.body.senderId, a.user._id); assert.equal((await incoming)._id, sent.body._id);
 assert.equal((await request(app).get(`/api/messages/${a.user._id}`).set('Cookie', b.cookie)).body[0].text, 'Hello Bob');
 assert.deepEqual((await request(app).get(`/api/messages/${a.user._id}`).set('Cookie', c.cookie)).body, []);
 for (const body of [{ text: ' ' }, { text: {} }, { text: 'a'.repeat(4001) }, { image: 'https://internal.example' }]) assert.equal((await request(app).post(`/api/messages/send/${b.user._id}`).set('Cookie', a.cookie).send(body)).status, 400);
 assert.equal((await request(app).get('/api/messages/not-an-id').set('Cookie', a.cookie)).status, 400);
 const disconnected = event(alice, 'disconnect'); await request(app).post('/api/auth/logout').set('Cookie', a.cookie); await disconnected;
});
test('history uses bounded cursor pagination without overlap', async () => {
 const a = await signup('Dave'), b = await signup('Eve');
 const { default: Message } = await import('../src/models/message.model.js');
 await Message.insertMany(Array.from({ length: 55 }, (_, i) => ({ senderId: a.user._id, receiverId: b.user._id, text: String(i) })));
 const page = await request(app).get(`/api/messages/${b.user._id}`).set('Cookie', a.cookie);
 assert.equal(page.body.length, 50);
 const older = await request(app).get(`/api/messages/${b.user._id}?before=${page.body[0]._id}`).set('Cookie', a.cookie);
 assert.equal(older.body.length, 5);
 assert.equal(new Set([...older.body, ...page.body].map(m => m._id)).size, 55);
});
