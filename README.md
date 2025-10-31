# INFO2222-TUT07-G06-P2
## Deployment website: https://student-communication-platform.onrender.com
it can delay requests by 50 seconds or more because using a free server

## Run locally:
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


## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3
- Radix UI component suite (`@radix-ui/react-*`)
- Express 5 + custom HTTPS server
- Supporting libraries: React Hook Form, Zod, Recharts, Lucide Icons, Tailwind Merge, Sonner, and more

