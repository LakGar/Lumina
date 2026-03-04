import { type Metadata } from "next";
import LandingLayout from "@/components/landing/LandingLayout";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Lumina. Please read these terms carefully before using our services.",
};

export default function TermsPage() {
  return (
    <LandingLayout>
      <TermsContent />
    </LandingLayout>
  );
}
