import { type Metadata } from "next";
import LandingLayout from "@/components/landing/LandingLayout";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Lumina. How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <LandingLayout>
      <PrivacyContent />
    </LandingLayout>
  );
}
