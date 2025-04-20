"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { ArrowRight, Loader2 } from "lucide-react";

export function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("Signup form submission started");
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    console.log("Sending signup data:", data);

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Signup response received:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to join waitlist");
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return (
    <section className="py-32 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight">
            Be Among the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              First to Journal
            </span>{" "}
            with AI
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Reserve your spot for Lumina&apos;s early access.
          </p>
          <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              action="javascript:void(0);"
            >
              <div className="space-y-4">
                <Input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Your email"
                  required
                  className="w-full h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && (
                <p className="text-green-500 text-sm">
                  Successfully joined the waitlist!
                </p>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white text-lg font-medium transition-all duration-300 group"
                onClick={(e) => e.stopPropagation()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join the Waitlist
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              No spam. Just first access and thoughtful updates.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
