![Relay — REALTIME CONVERSATIONS](docs/project-banner.svg)

[Open live app](https://chat.jasonbreedlove.dev) · [Portfolio](https://www.jasonbreedlove.dev) · [Browse source](https://github.com/Breedlove-Jason/realtime-chat-app)

# Relay — realtime conversations

A full-stack messenger by Jason Breedlove, built with React 19, Express 5, MongoDB, and Socket.IO. This extends the existing chat project with authenticated sockets, a consistent account API, safer uploads, and a portfolio preview.

## Engineering focus

Authenticated realtime delivery, persistent private conversations, and resilient client state in one deployed full-stack application.

## Features

- Email/password signup and login with HttpOnly session cookies.
- Server-authenticated Socket.IO connections; clients cannot select another user's identity.
- Private one-to-one message history, image attachments, and profile pictures (Cloudinary optional).
- Multi-tab online presence, typing indicators, connection state, and in-session unread counts.
- Contact search, search within loaded messages, and 50-message cursor pagination.
- Duplicate-safe message merging and preserved drafts on failed sends.
- 32 themes, responsive layout, reduced-motion support, and accessible control names.
- Public interactive `/demo`: clearly labeled sample conversation with tab-local messages. No fake live users or simulated server delivery.
- Health checks, graceful shutdown, rate limits, input validation, security headers, CI, Docker, and Render blueprint.

## Local development

Use Node 24.

```sh
npm ci --prefix backend
npm ci --prefix frontend
cp .env.example backend/.env
# Set a random JWT_SECRET and your local or Atlas MONGODB_URI in backend/.env.
npm run dev --prefix backend
# In another terminal:
npm run dev --prefix frontend
```

Open http://localhost:5173. Vite proxies `/api` and `/socket.io` to the backend at port 5006. Create two accounts in separate browser profiles for a real chat. The public directory exposes display names and avatars to other registered users; it does not expose their emails. This is a small portfolio community, not a private organization directory.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). The supported baseline is **one persistent Node service serving both the built frontend and backend**, plus MongoDB Atlas. `render.yaml` and `Dockerfile` are included. No secrets are embedded in client code.

```sh
npm run build
NODE_ENV=production npm start
```

Set `CLIENT_ORIGIN` to the exact HTTPS origin visitors will use. Add multiple origins as a comma-separated list if needed. For local testing of the production build over plain HTTP, secure cookies will not work; use development mode or an HTTPS reverse proxy.

## Verification

```sh
npm run lint
npm test
```

Integration tests use an isolated temporary MongoDB, not your production database. They test signup/login, unauthenticated socket rejection, server-owned sender identity, typing, persisted delivery, private history, upload validation, origin checks, logout disconnection, and pagination. The first run downloads a MongoDB binary. Run on a host that permits starting MongoDB (GitHub Actions Ubuntu is configured).

## Scope and limitations

- One Node instance. In-memory presence and rate limiting require shared infrastructure before horizontal scaling.
- Messages are stored in MongoDB; this is **not end-to-end encrypted**.
- Unread counts are session-local; no persistent read receipts yet.
- Contact list is limited to 200 users; message search covers loaded history.
- No password recovery, email verification, blocking/reporting, or moderation console yet. Do not present this portfolio release as a large public messaging service.
- Logging out disconnects current sockets and clears the cookie. JWTs expire after seven days; server-side token revocation is not yet implemented.
- Image delivery needs Cloudinary credentials. Text chat works without Cloudinary.
- Demo messages are illustrative, stay in memory, and reset on refresh.

## Credits

Built on the account, profile, theme, and messaging work already present in this repository. Dependency licenses remain their respective authors'.
