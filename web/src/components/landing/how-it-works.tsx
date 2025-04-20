"use client";
import React, { useState } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  modalContent: {
    title: string;
    description: string;
    stats: { label: string; value: string }[];
    quote: string;
    quoteAuthor: string;
  };
}

const FeatureCard = ({
  title,
  description,
  image,
  modalContent,
}: FeatureCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Card
          className="relative h-[500px] overflow-hidden group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 pr-16">
            <h3 className="text-2xl font-display font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-200 leading-relaxed">{description}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center text-xl backdrop-blur-sm hover:bg-white/20 transition-colors duration-200 shadow-lg border-0"
          >
            +
          </motion.button>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[85vw] h-[85vh] bg-white p-0 overflow-hidden rounded-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="relative">
            <div className="relative h-[400px] overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover brightness-[0.9]"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 translate-y-1/2">
              <div className="mx-16">
                <DialogTitle className="text-5xl font-display font-medium text-black bg-white px-8 py-6 rounded-xl shadow-xl backdrop-blur-sm bg-white/90">
                  {modalContent.title}
                </DialogTitle>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-16 pt-24 overflow-y-auto h-[calc(85vh-400px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <p className="text-gray-600 leading-relaxed text-lg max-w-3xl">
              {modalContent.description}
            </p>
            <blockquote className="border-l-4 border-purple-600 pl-6 py-4 italic text-gray-600 bg-gray-50/50 rounded-r-xl backdrop-blur-sm">
              &quot;{modalContent.quote}&quot;
              <footer className="mt-3 text-sm text-gray-500">
                — {modalContent.quoteAuthor}
              </footer>
            </blockquote>
            <div className="grid grid-cols-3 gap-8">
              {modalContent.stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-transform duration-300 hover:scale-105"
                >
                  <div className="text-4xl font-display font-bold text-purple-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export function HowItWorks() {
  const features = [
    {
      title: "Speak or Type Freely",
      description: "Express yourself naturally through voice or text",
      image: "/landing-speak.jpg",
      modalContent: {
        title: "Natural Expression",
        description:
          "Lumina adapts to your preferred way of journaling, whether you're speaking your thoughts or typing them out. Our AI understands context and emotion, making your journaling experience as natural as having a conversation.",
        stats: [
          { label: "Voice Accuracy", value: "98%" },
          { label: "Languages", value: "50+" },
          { label: "Response Time", value: "<1s" },
        ],
        quote:
          "Lumina has transformed how I journal. I can just speak my mind and it understands me perfectly.",
        quoteAuthor: "Sarah M., Daily User",
      },
    },
    {
      title: "AI Organizes Your Thoughts",
      description: "Intelligent analysis preserves your unique voice",
      image: "/landing-thoughts.jpg",
      modalContent: {
        title: "Smart Organization",
        description:
          "Our advanced AI analyzes your entries to identify patterns, themes, and emotional journeys. It organizes your thoughts while maintaining your authentic voice and perspective.",
        stats: [
          { label: "Themes Identified", value: "100+" },
          { label: "Accuracy", value: "95%" },
          { label: "Users", value: "10K+" },
        ],
        quote:
          "The way Lumina organizes my thoughts is like having a personal assistant for my mind.",
        quoteAuthor: "Michael R., Product Manager",
      },
    },
    {
      title: "Recall Anything, Instantly",
      description: "Access memories with natural language queries",
      image: "/landing-recall.jpg",
      modalContent: {
        title: "Instant Recall",
        description:
          "Search through your journal using natural language. Ask questions about past entries, get summaries of specific time periods, or find patterns in your thoughts and emotions.",
        stats: [
          { label: "Search Speed", value: "0.2s" },
          { label: "Entries Indexed", value: "1M+" },
          { label: "Query Types", value: "50+" },
        ],
        quote:
          "Finding old entries is so easy. It's like having a photographic memory of my thoughts.",
        quoteAuthor: "David L., Writer",
      },
    },
  ];

  return (
    <section className="py-32 bg-white relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight">
            A Journal That{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Writes With You
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Experience the future of personal reflection with AI-powered
            journaling
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
