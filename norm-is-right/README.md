# Norm Is Right

Next.js app with persistent state backed by Vercel Blob.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel Blob Persistence

State persistence is implemented via `src/app/api/state/route.ts`.

- `GET /api/state` loads latest saved app state from Blob.
- `POST /api/state` saves app state to Blob.

The client syncs through `src/lib/storage.ts` and `src/app/page.tsx`.

### Required Environment Variable

Set `BLOB_READ_WRITE_TOKEN` in Vercel project environment variables.

For local testing, add a `.env.local` file:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

Without Blob configuration, the app still works with local browser storage fallback.
