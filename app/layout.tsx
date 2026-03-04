import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { LandingModalsProvider } from "@/components/landing/LandingModalsContext";
import { Playfair_Display, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lumina – A Quiet Space for Your Loudest Thoughts",
    template: "%s | Lumina",
  },
  description:
    "Reflect, plan, and find clarity. Lumina is a journaling app to help you grow with AI-powered reflection, streaks, and a space for your thoughts.",
  keywords: ["journaling", "reflection", "mindfulness", "Lumina", "journal app"],
  authors: [{ name: "Lumina" }],
  openGraph: {
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${playfair.variable} ${inter.variable} ${geistMono.variable} font-body antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
            <LandingModalsProvider>{children}</LandingModalsProvider>
          </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
