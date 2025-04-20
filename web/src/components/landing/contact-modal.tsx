import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-2xl bg-white p-0 overflow-hidden rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="relative">
          <div className="p-8">
            <DialogTitle className="text-3xl font-display font-bold mb-2">
              Get in Touch
            </DialogTitle>
            <p className="text-gray-600 mb-8">
              We&apos;d love to hear from you. Send us a message and we&apos;ll
              respond as soon as possible.
            </p>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Your name"
                    className="h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Your email"
                    className="h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Your message"
                  className="min-h-[150px] text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white text-lg font-medium transition-all duration-300"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
