import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/navbar";
import CTA from "@/components/landing/CTA";
import Feature from "@/components/landing/feature";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import { Footer } from "@/components/ui/footer";
import { Facebook, Hexagon, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Home() {
  return (
    <div style={{ backgroundColor: "#FDFCF9" }}>
      <Navbar />
      <Hero />
      <Feature />
      <HowItWorks />
      <PricingSection />
      <CTA />
      <Footer
        logo={<Hexagon className="h-10 w-10" />}
        brandName="Lumina"
        socialLinks={[
          {
            icon: (
              <Twitter className="h-5 w-5 text-black group-hover:text-white" />
            ),
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: (
              <Linkedin className="h-5 w-5 text-black group-hover:text-white" />
            ),
            href: "https://linkedin.com",
            label: "LinkedIn",
          },
          {
            icon: (
              <Instagram className="h-5 w-5 text-black group-hover:text-white" />
            ),
            href: "https://instagram.com",
            label: "Instagram",
          },
          {
            icon: (
              <Facebook className="h-5 w-5 text-black group-hover:text-white" />
            ),
            href: "https://facebook.com",
            label: "Facebook",
          },
        ]}
        mainLinks={[
          { href: "/#features", label: "Features" },
          { href: "/#pricing", label: "Pricing" },
          { href: "/#contact", label: "Contact" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms" },
        ]}
        copyright={{
          text: "© 2026 Lumina. All rights reserved.",
          license: "All rights reserved",
        }}
      />
    </div>
  );
}
