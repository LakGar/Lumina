"use client";

import React from "react";
import Navbar from "@/components/landing/navbar";
import { Footer } from "@/components/ui/footer";
import { Facebook, Hexagon, Instagram, Linkedin, Twitter } from "lucide-react";

const defaultFooterProps = {
  logo: <Hexagon className="h-10 w-10" style={{ color: "#2c2419" }} />,
  brandName: "Lumina",
  socialLinks: [
    {
      icon: <Twitter className="h-5 w-5" style={{ color: "#2c2419" }} />,
      href: "https://x.com",
      label: "Twitter",
    },
    {
      icon: <Linkedin className="h-5 w-5" style={{ color: "#2c2419" }} />,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: <Instagram className="h-5 w-5" style={{ color: "#2c2419" }} />,
      href: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: <Facebook className="h-5 w-5" style={{ color: "#2c2419" }} />,
      href: "https://facebook.com",
      label: "Facebook",
    },
  ],
  mainLinks: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ],
  legalLinks: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
  copyright: {
    text: "© 2026 Lumina. All rights reserved.",
    license: "All rights reserved",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: "#f7f4ef" }}>
      <Navbar />
      {children}
      <Footer {...defaultFooterProps} />
    </div>
  );
}
