import type { Metadata, Viewport } from "next";
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
    default: "Makanika",
    template: "%s | Makanika",
  },
  description: "Find trusted, verified car mechanics in Harare. Search by location, car type, and speciality.",
  keywords: ["mechanic", "Harare", "Zimbabwe", "car repair", "car mechanic", "garage", "sedan", "SUV", "hatchback"],
  openGraph: {
    title: "Makanika",
    description: "Find trusted, verified car mechanics in Harare. Search by location, car type, and speciality.",
    type: "website",
    locale: "en_ZW",
    siteName: "Makanika",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
