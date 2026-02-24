import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Harare Mechanic Finder",
    template: "%s | Harare Mechanic Finder",
  },
  description: "Find trusted, verified mechanics in Harare. Search by location, vehicle type, and speciality.",
  keywords: ["mechanic", "Harare", "Zimbabwe", "auto repair", "car repair", "vehicle", "garage"],
  openGraph: {
    title: "Harare Mechanic Finder",
    description: "Find trusted, verified mechanics in Harare. Search by location, vehicle type, and speciality.",
    type: "website",
    locale: "en_ZW",
    siteName: "Harare Mechanic Finder",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
