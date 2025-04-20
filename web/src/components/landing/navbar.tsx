"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group w-16 h-16"
          >
            <span className="text-xl font-display font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
              Lumina
            </span>
          </Link>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("differentiators")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("science")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Science
            </button>
          </div>
          {/* CTA Button */}
          <Button
            variant="default"
            className="bg-gray-900 hover:bg-gray-800 text-white text-sm transition-colors"
            onClick={() => scrollToSection("signup")}
          >
            Get Early Access
          </Button>
        </div>
      </div>
    </nav>
  );
}
