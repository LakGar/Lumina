import Hero from "@/components/landing/hero";
import Navigation from "@/components/landing/navigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      <Navigation />
      <Hero />
    </main>
  );
}
