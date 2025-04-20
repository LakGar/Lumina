import React from "react";
import { Card } from "../ui/card";
import {
  Sparkles,
  Brain,
  Mic,
  Shield,
  Heart,
  Lightbulb,
  TrendingUp,
  Calendar,
} from "lucide-react";

export function Differentiators() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight">
          Built for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Clarity
          </span>
          , Not Clutter
        </h2>
        <p className="text-lg md:text-xl text-center text-gray-600 max-w-3xl mx-auto mb-16">
          Unlike typical journaling apps, Lumina focuses on helping you make
          sense of your thoughts. Whether you&apos;re tracking emotional growth,
          brainstorming ideas, or just venting after a long day — Lumina becomes
          your mirror, memory, and motivator.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Key Features
            </h3>
            <ul className="space-y-6 text-gray-600">
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="pt-1">AI that sounds like you</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="pt-1">Smart tags & timeline insights</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="pt-1">Voice journaling</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="pt-1">100% private, local-first option</span>
              </li>
            </ul>
          </Card>
          <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Use Cases
            </h3>
            <ul className="space-y-6 text-gray-600">
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="pt-1">Emotional tracking</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <span className="pt-1">Idea development</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="pt-1">Personal growth</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="pt-1">Daily reflection</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
