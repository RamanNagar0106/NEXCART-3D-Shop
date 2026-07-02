# NEXCART - Online Shopping Platform

A full-featured e-commerce platform modeled after Flipkart, built with React + Vite frontend, Express API backend, PostgreSQL database, and 3D/animated UI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/nexcart run dev` — run the frontend (port 24711)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS v4, framer-motion, wouter, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nexcart/src/pages/` — all page components (Home, Products, ProductDetail, Cart, Wishlist, Orders, Checkout, Search)
- `artifacts/nexcart/src/components/` — shared UI components (Navbar, ProductCard, Chatbot, StarRating, etc.)
- `artifacts/nexcart/src/hooks/use-session.ts` — sessionId management (localStorage key: `nexcart_session`)
- `artifacts/api-server/src/routes/` — API route handlers (products, categories, cart, wishlist, orders, reviews, chatbot)
- `lib/db/src/schema/` — Drizzle schema: products.ts, cart.ts, reviews.ts
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `attached_assets/` — NEXCART logo PNG

## Product Features

- Homepage with animated hero banner carousel, category grid, deals of the day, featured products, chatbot bubble
- Product listing with filters (price range, brand, rating, stock), sorting, search
- Product detail with image gallery, specs, reviews, related products, pincode checker
- Shopping cart with quantity controls, discount display, delivery estimate
- Wishlist with move-to-cart functionality
- Order placement and history with status tracking
- AI shopping chatbot (pattern-matching + product search)
- Search with live autocomplete suggestions

## Architecture decisions

- Session-based (no auth): sessionId generated via `crypto.randomUUID()`, stored in localStorage as `nexcart_session`, passed as query param or request body
- GET /orders/:id enforces session ownership check to prevent IDOR
- Free delivery over Rs 499, Rs 49 below
- Cart/wishlist mutations invalidate React Query caches for UI consistency
- Chatbot is rule-based (keyword matching + DB product search), no external LLM

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` then `pnpm run typecheck:libs`
- `pnpm run typecheck:libs` must be run before `pnpm --filter @workspace/api-server run typecheck` to rebuild lib declarations
- Product images use Unsplash URLs — require internet access to render
- The `inStock` filter in `listProducts` uses the `inStock` query param (boolean as string "true"/"false")
