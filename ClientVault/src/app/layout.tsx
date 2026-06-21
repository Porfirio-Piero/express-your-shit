import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClientVault — Freelancer Onboarding & Document Hub',
  description: 'Collect client documents, intake forms, and briefs through a branded portal. No more email chaos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}