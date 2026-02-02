import React from "react";
import { CircleCheck } from "lucide-react";

const page = () => {
  const steps = [
    {
      id: 0,
      title: "Welcome",
    },
    {
      id: 1,
      title: "Basic Information",
    },
    {
      id: 2,
      title: "Create your first journal",
    },
    {
      id: 3,
      title: "Create your first entry",
    },
    {
      id: 4,
      title: "Set up reminders",
    },
  ];
  return (
    <div className="flex h-screen p-4 bg-white">
      <div>
        {/* Logo */}
        <div>
          <h1 className="text-xl font-bold text-black">Lumina</h1>
        </div>
        {/* Steps */}
        <div className="flex flex-col gap-2 mt-10 relative">
          <div className="absolute h-31 w-0.5 bg-black/20 left-2 top-1 z-1" />
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <CircleCheck className="size-4.5 text-green-600 z-10 bg-white rounded-full" />
              <p className="text-sm text-black/70">{step.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
