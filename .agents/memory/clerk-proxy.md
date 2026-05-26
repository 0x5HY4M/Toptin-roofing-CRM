---
name: Clerk Proxy Setup
description: How Clerk proxy middleware is wired in this project
---

## Server (Express)
- Import `clerkProxyMiddleware`, `CLERK_PROXY_PATH`, `getClerkProxyHost` from `./middlewares/clerkProxyMiddleware`
- Mount BEFORE cors/json: `app.use(CLERK_PROXY_PATH, clerkProxyMiddleware())`
- clerkMiddleware uses `publishableKeyFromHost(getClerkProxyHost(req) ?? "", process.env.CLERK_PUBLISHABLE_KEY)`

## Client (React)
- `proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}` on ClerkProvider
- `publishableKey` derived via `publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)`
- The VITE_CLERK_PROXY_URL env var is set automatically by Replit Clerk integration

**Why:** Replit's proxy routes Clerk auth through `/api/__clerk` so the app works on the shared preview domain without CORS issues.
