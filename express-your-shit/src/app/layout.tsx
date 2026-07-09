import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Express Your Sh*t — Say it with shit.",
  description: "Premium anonymous gag-gift service. Certified, sealed, and delivered with the gravity it deserves. Say it with shit.",
  keywords: "send poop, anonymous poop delivery, gag gift, shitexpress alternative, poopsenders alternative, anonymous gift, prank gift",
  openGraph: {
    title: "Express Your Sh*t — Say it with shit.",
    description: "Premium anonymous gag-gift service. Certified grievances, delivered sealed.",
    type: "website",
    url: "https://expressyourshit.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}