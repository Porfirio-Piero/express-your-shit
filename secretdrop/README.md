# SecretDrop - Self-Destructing Secret Sharing

🔐 **Secure, encrypted, one-time secret sharing**

SecretDrop allows you to share passwords, API keys, private notes, and other sensitive information securely. Your secrets are encrypted in your browser using AES-256-GCM before they ever reach our servers.

## Features

- 🔒 **End-to-End Encryption** - Secrets encrypted client-side with AES-256-GCM
- 🔥 **Self-Destructing** - One view, then permanently deleted
- ⏰ **Time Expiration** - Auto-delete after set time (1h to 30d)
- 👁️ **View Limits** - Control how many times a secret can be viewed
- 🔑 **Password Protection** - Optional extra layer of security
- 💳 **Pro Tier** - Unlimited secrets with extended features

## How It Works

1. **Encrypt**: Your secret is encrypted in your browser using the Web Crypto API
2. **Upload**: Only encrypted data is sent to our servers - we never see plaintext
3. **Share**: Send the link to your recipient
4. **Burn**: Once viewed, the secret is permanently deleted

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Edge Runtime)
- **Storage**: Vercel Blob
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Payments**: Stripe

## Security

- All secrets are encrypted client-side before upload
- Encryption keys are stored in the URL hash (never sent to server)
- Server only stores encrypted ciphertext, IV, and salt
- No plaintext secrets ever touch our servers
- One-time retrieval with automatic deletion

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
BLOB_READ_WRITE_TOKEN=          # Vercel Blob token
STRIPE_SECRET_KEY=              # Stripe secret key
STRIPE_PUBLISHABLE_KEY=         # Stripe publishable key
STRIPE_PRICE_ID=                # Stripe price ID for Pro tier
```

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

## License

MIT