import { type Metadata } from "next";
import LandingLayout from "@/components/landing/LandingLayout";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Lumina team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <LandingLayout>
      <ContactContent />
    </LandingLayout>
  );
}
