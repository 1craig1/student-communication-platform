# INFO2222-TUT07-G06-P2

## Prerequisites
- Node.js ≥ 18.17 (required by Next.js 15)
- Preferred package manager: `pnpm` (you can use `npm` if you prefer)

## Install Dependencies
```bash
pnpm install
# or
npm install
```

## Development Mode
```bash
pnpm run dev
# or
npm run dev
```
- Starts an HTTPS server at `https://localhost:3000` using the self-signed certificate stored in `certs/server.pem` and `certs/server.key`.
- The browser may warn about the untrusted certificate the first time; trust the certificate locally or proceed manually.

## Production Mode
```bash
pnpm run build
pnpm run start
# or
npm run build
npm run start
```
- `start` uses `server.js` to serve the built Next.js app over HTTPS.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3
- Radix UI component suite (`@radix-ui/react-*`)
- Express 5 + custom HTTPS server
- Supporting libraries: React Hook Form, Zod, Recharts, Lucide Icons, Tailwind Merge, Sonner, and more

## Deployment
- **Update `server.js` for hosting**:
  - Read `process.env.PORT` and `process.env.HOSTNAME` (default to `3000` and `0.0.0.0`) so the process can run on the port assigned by the platform.
  - Optionally load cert paths from environment variables when deploying behind your own TLS termination.
- **Deploy on a managed host (example: Render)**:
  1. Push the project to a Git repository (GitHub/GitLab).
  2. Create a new **Web Service** on [Render](https://render.com), connect the repository, and pick the `pnpm` build & start commands:
     - Build command: `pnpm install && pnpm run build`
     - Start command: `pnpm run start`
  3. Render terminates HTTPS for you, so you can delete the local `certs` usage or adjust `server.js` to fall back to plain HTTP when `NODE_ENV=production` (Render provides TLS on its own domain).
  4. After the build finishes, Render exposes a public URL like `https://your-app.onrender.com` that you can share immediately.
- **Alternative hosts**:
  - Railway, Fly.io, and Google Cloud Run follow similar steps—deploy the repo, set the build/start commands, and use their generated HTTPS endpoint.
  - If you self-host, place the app behind Nginx/Caddy, use Let’s Encrypt certificates, and proxy incoming `https://your-domain` traffic to the Node process.
