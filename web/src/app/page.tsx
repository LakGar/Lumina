import React from "react";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Differentiators } from "@/components/landing/differentiators";
import { Science } from "@/components/landing/science";
import { Signup } from "@/components/landing/signup";
import { Trust } from "@/components/landing/trust";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="pt-16">
        <Hero />
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="differentiators">
          <Differentiators />
        </section>
        <section id="science">
          <Science />
        </section>
        <section id="trust">
          <Trust />
        </section>
        <section id="signup">
          <Signup />
        </section>
      </div>
      <Footer />
    </main>
  );
}
