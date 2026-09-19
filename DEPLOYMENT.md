# Deploy Relay

## Recommended: one Node service

Deploy the repository as a Render Web Service using the included blueprint, or run its Docker image on a persistent Node host. Serving the UI and API together avoids cross-site cookie and socket routing problems.

Required environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | A dedicated Atlas database connection string for Relay |
| `JWT_SECRET` | Random secret, at least 32 characters; blueprint generates it |
| `CLIENT_ORIGIN` | Exact public origin, e.g. `https://chat.jasonbreedlove.dev` |
| `PORT` | Host-provided; defaults to `5006` |

Optional image uploads: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Text messaging works without them. Leave optional values empty if unused.

Build command: `npm run build`

Start command: `npm start`

Health check: `/api/health`

Connect the host's outbound addresses in Atlas Network Access. Use a database user scoped to the Relay database. Keep the service at one instance until a shared Socket.IO adapter and rate-limit store are added. A sleeping free service can take time to wake; use an always-on plan for predictable demos if desired.

## Domain

DNS can remain on Vercel. Add `chat.jasonbreedlove.dev` as a custom domain on the Node host, then add the exact DNS record the host provides in Vercel DNS. Set `CLIENT_ORIGIN` to that HTTPS URL and verify TLS before testing cookies. Do not move nameservers or change the existing portfolio/NeuroIQ records.

## Vercel hosting considerations

This code uses a persistent Socket.IO server and in-memory room/presence state. It is **not packaged as a Vercel Function**. Native Vercel WebSocket support does not by itself provide cross-instance room broadcasts or shared presence. Deploy the included Node service for this release. A Vercel-only variant would require a separate shared realtime architecture and deployment verification.

References: [Vercel WebSockets](https://vercel.com/docs/functions/websockets), [Render Express deployment](https://render.com/docs/deploy-node-express-app), [Socket.IO middleware](https://socket.io/docs/v4/middlewares/).

## Release checks

1. Require the `Validate Relay` GitHub Actions check to pass before merging the preparation PR.
2. Set the required secrets on the chosen host and deploy the reviewed branch.
3. Check `/api/health` returns 200.
4. Open the app in two browser profiles; register two accounts.
5. Send messages both ways; confirm reload persistence, typing, and private history.
6. Open a second tab, close one tab, and verify presence remains online.
7. Disconnect/reconnect and verify history recovers. Test optional images after Cloudinary is configured.
8. Confirm `/demo`, `/login`, and `/profile` direct links load on HTTPS.

Preparation is not a live deployment. No paid services are provisioned by these files.
