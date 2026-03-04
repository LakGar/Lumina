import { type Metadata } from "next";
import LandingLayout from "@/components/landing/LandingLayout";
import FeaturesContent from "./FeaturesContent";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Journals & entries, AI-powered reflection, Lumina level, and chat with context. See how Lumina helps you reflect and find clarity.",
};

export default function FeaturesPage() {
  return (
    <LandingLayout>
      <FeaturesContent />
    </LandingLayout>
  );
}
