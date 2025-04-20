import React from "react";
import { Card } from "../ui/card";
import { Shield, Heart, Users } from "lucide-react";

export function Trust() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight">
            Built with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Trust & Care
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Your privacy and well-being are our top priorities
          </p>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100 group">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
                Your privacy, always protected
              </h3>
              <p className="text-gray-600 text-center">
                End-to-end encrypted + local-first storage planned
              </p>
            </Card>
            <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100 group">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
                Built with well-being in mind
              </h3>
              <p className="text-gray-600 text-center">
                Rooted in research, guided by simplicity
              </p>
            </Card>
            <Card className="p-8 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl hover:border-purple-100 group">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
                For everyone in between
              </h3>
              <p className="text-gray-600 text-center">
                Lumina adapts to your style
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
