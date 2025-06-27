"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      signIn("google");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10" />
      <video
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Illuminate Your Mind
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          AI-powered journaling designed for clarity and self-awareness.
          Transform your thoughts into insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg"
          >
            {session ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Voice-to-Text</h3>
            <p className="text-gray-300">Speak your thoughts naturally</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-300">Discover patterns in your thinking</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
            <p className="text-gray-300">Find what matters most</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
