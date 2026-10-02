# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build (also the only type/compile check available)
- `npm start` — serve the production build

There is no linter, formatter script, or test suite configured.

## Stack

Next.js 16 App Router + React 19, plain JavaScript (`.js`/`.jsx`, no TypeScript), MongoDB via Mongoose 9, NextAuth v4 (Google OAuth only), Tailwind CSS 4, Cloudinary for image uploads, Mapbox + Google Geocoding for maps. Deployed on Vercel. Path alias `@/*` maps to the repo root.

Required env vars: `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (NextAuth), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_GOOGLE_GEOCODING_API_KEY`. See `.env.sample`.

## Architecture

**Data flow: reads in Server Components, writes in Server Actions.** There are no REST API routes besides `app/api/auth/[...nextauth]`. Pages under `app/` are async Server Components that call `connectDB()` and query Mongoose models directly. All mutations live in `app/actions/*.js` (one default-exported `'use server'` function per file) and are called from client components or `<form action={...}>`.

**Server Action pattern** (follow this when adding new actions):
1. `await connectDB()`
2. `const sessionUser = await getSessionUser()` (`utils/getSessionUser.js`) and throw if no `userId`
3. Verify ownership where relevant (e.g. property `owner` / message `recipient` must equal `userId`)
4. Mutate, then `revalidatePath(...)` and optionally `redirect(...)`
Form fields use dotted names (`location.city`, `rates.nightly`, `seller_info.email`) that the action maps into nested schema objects manually. Images are uploaded to Cloudinary (folder `propertypulse`) as base64 data URIs inside the action.

**Serialization:** Mongoose documents passed from Server Components to Client Components must be plain. Use `.lean()` and then `convertToSerializableObject()` (`utils/convertToObject.js`), which stringifies top-level `ObjectId`/`Date` fields. For arrays of docs, map over them.

**Auth:**
- `utils/authOptions.js` — the `signIn` callback creates a `User` in MongoDB on first login; the `session` callback attaches the MongoDB `_id` as `session.user.id`. That id is what `getSessionUser()` returns as `userId`.
- `middleware.js` — `withAuth` protects routes listed in `config.matcher`; add new protected routes there.
- `components/AuthProvider.jsx` wraps the app in NextAuth's `SessionProvider` (in `app/layout.jsx`).

**Global state:** `context/GlobalContext.js` holds only `unreadCount` for the navbar message badge. It is fetched via the `getUnreadMessageCount` action when a session exists; client components that read/delete messages call `setUnreadCount` to keep it in sync.

**Models** (`models/`): `User` (with `bookmarks: [Property ref]`), `Property` (`owner` ref, `is_featured` flag drives `FeaturedProperties`), `Message` (`sender`, `recipient`, `property` refs, `read` flag). Models use the `models.X || model('X', schema)` pattern to survive hot reload.

**Pagination & search:** `/properties` reads `page`/`pageSize` from `searchParams` (note `searchParams` and `params` are Promises in Next 16 and must be awaited). `/properties/search-results` filters by `location` and `propertyType` query params.

**Remote images:** `next.config.mjs` whitelists `lh3.googleusercontent.com` (Google avatars) and `res.cloudinary.com`; add hosts there if using `next/image` with new sources.

`properties.json` / `properties2.json` at the repo root are seed data, not imported by the app.
