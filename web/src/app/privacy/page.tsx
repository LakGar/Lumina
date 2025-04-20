import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">Last updated: March 2024</p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 mb-6">
              At Lumina, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, and protect your personal
              information when you use our journaling application.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Information We Collect
            </h2>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Account information (email, name)</li>
              <li>Journal entries and content</li>
              <li>Usage data and analytics</li>
              <li>Device information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>To provide and improve our services</li>
              <li>To personalize your experience</li>
              <li>To communicate with you</li>
              <li>To ensure security and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Data Security
            </h2>
            <p className="text-gray-600 mb-6">
              We implement industry-standard security measures to protect your
              data. All journal entries are encrypted, and we regularly update
              our security practices.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-600 mb-6">
              You have the right to access, correct, or delete your personal
              information. You can also opt-out of certain data collection
              practices.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@lumina.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
