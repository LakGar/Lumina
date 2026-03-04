import { type Metadata } from "next";
import LandingLayout from "@/components/landing/LandingLayout";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Lumina. Start free and upgrade when you're ready.",
};

export default function PricingPage() {
  return (
    <LandingLayout>
      <PricingContent />
    </LandingLayout>
  );
}
