import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">Last updated: March 2024</p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Agreement to Terms
            </h2>
            <p className="text-gray-600 mb-6">
              By accessing or using Lumina, you agree to be bound by these Terms
              of Service. If you disagree with any part of the terms, you may
              not access the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Use License
            </h2>
            <p className="text-gray-600 mb-6">
              Permission is granted to temporarily use Lumina for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              User Responsibilities
            </h2>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Maintain the security of your account</li>
              <li>Not share your account credentials</li>
              <li>Use the service in compliance with laws</li>
              <li>Respect other users&apos; privacy</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Content Ownership
            </h2>
            <p className="text-gray-600 mb-6">
              You retain all rights to your journal entries and content. By
              using Lumina, you grant us a license to store and process your
              content to provide the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Service Modifications
            </h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify or discontinue the service at any
              time without notice. We shall not be liable for any modification,
              suspension, or discontinuance of the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600">
              If you have any questions about these Terms, please contact us at
              legal@lumina.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
