# Undergraduate Hub Store

Undergraduate Hub is a Bangladesh-focused stationery and campus essentials store for university students. The first version supports guest checkout, Cash on Delivery, manual bKash payments, order tracking, and an authenticated admin console for orders, stock, products, and customers.

## Run locally

```bash
pnpm install
PORT=8080 pnpm --filter @workspace/api-server run dev
PORT=22722 BASE_PATH=/ pnpm --filter @workspace/undergraduate-hub run dev
```

The storefront runs on `http://localhost:22722` and the API on `http://localhost:8080`. In Replit, the service definitions in the artifact manifests route `/api` to the API service and `/` to the static storefront.

## Environment

Required for a real database deployment:

- `DATABASE_URL` — PostgreSQL connection string.

Admin and optional production settings:

- `ADMIN_EMAIL` — admin login email (defaults to the demo email in development).
- `ADMIN_PASSWORD` — use a strong unique password in production (the development fallback is `admin1234`).
- `SESSION_SECRET` — long random value used to sign the HTTP-only admin session cookie.
- `CLIENT_ORIGIN` — allowed browser origin when the API is deployed separately.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — enables the admin image upload endpoint. The endpoint accepts a JSON image data URL under the `file` field and never exposes these values to the browser.

The current API uses a small in-memory store so a fresh Replit preview works without provisioning PostgreSQL. Replace that store with the existing Drizzle schema before a multi-instance production launch; in-memory orders and inventory reset when the API restarts.

## Test the core flow

```bash
pnpm run typecheck
PORT=5000 BASE_PATH=/ NODE_ENV=production pnpm run build
```

The API exposes:

- `GET /api/products` and `GET /api/products/:slug`
- `POST /api/orders` and `GET /api/orders/:orderNumber`
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`
- `GET /api/admin/dashboard`, `/orders`, `/products`, and `/customers`
- `PATCH /api/admin/orders/:id`, `POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`
- `POST /api/admin/upload` when Cloudinary is configured

Orders calculate totals from server-side product prices, validate stock, reduce stock atomically within the process, preserve line-item prices, and restore stock when an order is cancelled.