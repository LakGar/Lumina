import React from "react";

export function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        background: "linear-gradient(135deg, #ffe8f3, #d9f3ff)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.1))",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #ff9aa2, #ffb7b2, #ffdac1, #e2f0cb, #a2e4ff, #c9afff, #ffb7b2, #ff9aa2)",
          transform: "translate(-50%, -50%)",
          animation: "rotate 18s linear infinite",
          filter: "blur(50px)",
          opacity: 0.8,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[180%] h-[180%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #ff9aa2, #ffb7b2, #ffdac1, #e2f0cb, #a2e4ff, #c9afff, #ffb7b2, #ff9aa2)",
          transform: "translate(-50%, -50%)",
          animation: "rotate-reverse 10s linear infinite",
          filter: "blur(50px)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
