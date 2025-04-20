"use client";
import React, { useState } from "react";
import { ContactModal } from "./contact-modal";
import { Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <footer className="bg-gradient-to-b from-white to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <p className="text-gray-600 flex items-center gap-2">
                  © 2025 Lumina · Made with{" "}
                  <Heart className="w-4 h-4 text-purple-600" /> in California
                </p>
              </div>
              <nav className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("differentiators")}
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Features
                </button>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Terms
                </Link>

                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Contact
                </button>
              </nav>
            </div>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
