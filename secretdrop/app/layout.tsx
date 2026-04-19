import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecretDrop - Self-Destructing Secret Sharing',
  description: 'Share passwords, API keys, and private notes securely with one-time view links that self-destruct after opening. End-to-end encrypted.',
  keywords: 'secret sharing, encrypted messages, self-destructing, secure notes, password sharing',
  authors: [{ name: 'SecretDrop' }],
  openGraph: {
    title: 'SecretDrop - Self-Destructing Secret Sharing',
    description: 'Share secrets securely with one-time view links',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}