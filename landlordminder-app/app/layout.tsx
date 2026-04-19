import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LandlordMinder - Rental Property Maintenance Scheduler",
  description: "Proactive maintenance reminders for small landlords. Track HVAC, gutters, smoke detectors, and more.",
  keywords: ["landlord", "maintenance", "property management", "rental", "HVAC", "reminders"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}