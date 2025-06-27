import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumina - Illuminate Your Mind | AI-Powered Journaling",
  description:
    "AI-powered journaling designed for clarity and self-awareness. Voice-to-text, smart summaries, mood tracking, and semantic search to help you understand yourself better.",
  keywords: [
    "journaling",
    "AI",
    "voice-to-text",
    "mood tracking",
    "self-reflection",
    "mental health",
    "productivity",
  ],
  authors: [{ name: "Lumina Team" }],
  creator: "Lumina",
  publisher: "Lumina",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://lumina.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lumina - Illuminate Your Mind | AI-Powered Journaling",
    description:
      "AI-powered journaling designed for clarity and self-awareness. Transform your thoughts into insights.",
    url: "https://lumina.app",
    siteName: "Lumina",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Lumina - AI-Powered Journaling",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina - Illuminate Your Mind | AI-Powered Journaling",
    description:
      "AI-powered journaling designed for clarity and self-awareness. Transform your thoughts into insights.",
    images: ["/logo.png"],
    creator: "@lumina_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
