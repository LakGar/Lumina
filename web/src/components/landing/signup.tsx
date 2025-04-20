import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { ArrowRight } from "lucide-react";

export function Signup() {
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
            <form className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your name"
                  className="w-full h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  className="w-full h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white text-lg font-medium transition-all duration-300 group"
              >
                Join the Waitlist
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
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
