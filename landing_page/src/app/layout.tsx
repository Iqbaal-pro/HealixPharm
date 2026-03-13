import type { Metadata } from "next";
import "./globals.css";
import CursorGlow from "../components/CursorGlow";

export const metadata: Metadata = {
  title: "HealixPharm — Smart Pharmacy Management",
  description:
    "One platform. Zero pharmacy headaches. AI stock management, WhatsApp ordering, and medicine delivery for Sri Lankan pharmacies.",
  keywords: ["pharmacy", "AI", "WhatsApp", "medicine delivery", "Sri Lanka", "HealixPharm"],
  authors: [{ name: "HealixPharm Team" }],
  openGraph: {
    title: "HealixPharm — Smart Pharmacy Management",
    description: "One platform. Zero pharmacy headaches.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}