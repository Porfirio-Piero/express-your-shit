import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Norm Is Always Right | Track Predictions",
  description: "Track whether Norm was right about his predictions. Gamified prediction tracking with streaks, achievements, and fun!",
  keywords: ["predictions", "tracking", "gamification", "fun", "Norm"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
