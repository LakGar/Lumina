import React from "react";
import { Card } from "../ui/card";
import { Brain, Heart, Sparkles } from "lucide-react";

export function Science() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight">
            Journaling is{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Proven to Help
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Backed by science and loved by users worldwide
          </p>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100 group">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6" />
                </div>
                <blockquote className="text-gray-600 text-lg leading-relaxed">
                  &quot;Writing about thoughts and feelings improves memory,
                  sleep, and emotional regulation.&quot;
                </blockquote>
                <footer className="mt-6 text-sm text-gray-500 font-medium">
                  — American Psychological Association
                </footer>
              </div>
            </Card>
            <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100 group">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6" />
                </div>
                <blockquote className="text-gray-600 text-lg leading-relaxed">
                  &quot;Journaling reduced stress and improved well-being in 74%
                  of young adults studied.&quot;
                </blockquote>
                <footer className="mt-6 text-sm text-gray-500 font-medium">
                  — University of Rochester Study
                </footer>
              </div>
            </Card>
            <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100 group">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <blockquote className="text-gray-600 text-lg leading-relaxed">
                  &quot;I started journaling for clarity. Now, it&apos;s my
                  daily anchor.&quot;
                </blockquote>
                <footer className="mt-6 text-sm text-gray-500 font-medium">
                  — Ava M., designer & founder
                </footer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
