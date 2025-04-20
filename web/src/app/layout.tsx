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
  title: "Lumina - Your Mind, Illuminated",
  description:
    "Let AI turn your thoughts into powerful, private reflections. Join the waitlist for early access.",
  keywords: [
    "AI",
    "journaling",
    "reflection",
    "mental health",
    "privacy",
    "personal growth",
  ],
  authors: [{ name: "Lumina" }],
  openGraph: {
    title: "Lumina - Your Mind, Illuminated",
    description:
      "Let AI turn your thoughts into powerful, private reflections. Join the waitlist for early access.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina - Your Mind, Illuminated",
    description:
      "Let AI turn your thoughts into powerful, private reflections. Join the waitlist for early access.",
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
