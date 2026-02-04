"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleCheck,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  PenLine,
  User,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

const steps = [
  { id: 0, title: "Welcome", icon: Sparkles },
  { id: 1, title: "Basic Information", icon: User },
  { id: 2, title: "First journal", icon: BookOpen },
  { id: 3, title: "First entry", icon: PenLine },
];

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 16 : -16,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 16 : -16,
  }),
};

const transitionSmooth = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

const MOOD_OPTIONS = [
  "Calm",
  "Grateful",
  "Reflective",
  "Energized",
  "Peaceful",
  "Anxious",
  "Tired",
  "Hopeful",
  "Curious",
  "Uncertain",
] as const;

const OnboardPage = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [journalName, setJournalName] = useState("");

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  return (
    <div className="relative min-h-dvh w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Ambient background – soft drifting orbs */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <motion.div
          className="absolute -top-[20%] -right-[10%] h-[80vmin] w-[80vmin] rounded-full bg-neutral-200/40 blur-3xl"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.08, 0.98, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-[10%] -left-[15%] h-[60vmin] w-[60vmin] rounded-full bg-neutral-300/30 blur-3xl"
          animate={{
            x: [0, -40, 25, 0],
            y: [0, 20, -15, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-[40%] left-[30%] h-[50vmin] w-[50vmin] rounded-full bg-red-00 blur-3xl"
          animate={{
            x: [0, 15, -25, 0],
            y: [0, -20, 10, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Sidebar - desktop */}
      <aside className="relative z-10 hidden md:flex w-56 lg:w-64 shrink-0 flex-col bg-white/90 backdrop-blur-md p-8 lg:p-10 ">
        <h1 className="text-lg font-medium tracking-tight inline-block bg-linear-to-r from-blue-300 via-blue-600 to-blue-300 bg-clip-text text-transparent">
          Lumina
        </h1>
        <nav
          className="mt-12 flex flex-col gap-0"
          aria-label="Onboarding steps"
        >
          <div className="relative ml-2 flex flex-col">
            {/* Progress track */}
            <div
              className="absolute left-[9px] top-3 bottom-3 w-px rounded-full bg-neutral-200"
              aria-hidden
            />
            <motion.div
              className="absolute left-[9px] top-3 w-px rounded-full bg-neutral-400/40"
              initial={false}
              animate={{
                height:
                  steps.length > 1
                    ? `${(step / (steps.length - 1)) * 100}%`
                    : "0%",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              aria-hidden
            />
            {steps.map((s, i) => {
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <motion.div
                  key={s.id}
                  className="relative z-10 flex items-center gap-3 py-3"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, ...transitionSmooth }}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isComplete
                        ? "border-green-500 bg-green-500 text-white"
                        : isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-neutral-300 bg-white text-neutral-400"
                    }`}
                  >
                    {isComplete ? (
                      <CircleCheck className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      <span className="text-[10px] font-medium">
                        {s.id + 1}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      isActive
                        ? "font-medium text-primary"
                        : isComplete
                          ? "text-neutral-500"
                          : "text-neutral-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col md:min-h-0 bg-white/85 backdrop-blur-md min-h-0">
        {/* Mobile step dots */}
        <div className="flex md:hidden items-center justify-center gap-2 border-b border-neutral-200/60 bg-white/90 backdrop-blur-md px-4 py-4">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setDirection(step > s.id ? -1 : 1);
                setStep(s.id);
              }}
              className="flex flex-col items-center gap-1 transition-opacity duration-300"
              aria-label={`Go to step ${s.id + 1}: ${s.title}`}
            >
              <span
                className={`h-1 rounded-full transition-all duration-300 ease-out ${
                  step === s.id
                    ? "w-5 bg-primary"
                    : step > s.id
                      ? "w-1 bg-green-500"
                      : "w-1 bg-neutral-200"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col overflow-auto p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 0 && (
                <StepWelcome key="0" direction={direction} onNext={goNext} />
              )}
              {step === 1 && (
                <StepBasicInfo
                  key="1"
                  direction={direction}
                  displayName={displayName}
                  setDisplayName={setDisplayName}
                  onNext={goNext}
                  onPrev={goPrev}
                />
              )}
              {step === 2 && (
                <StepFirstJournal
                  key="2"
                  direction={direction}
                  journalName={journalName}
                  setJournalName={setJournalName}
                  onNext={goNext}
                  onPrev={goPrev}
                />
              )}
              {step === 3 && (
                <StepFirstEntry
                  key="3"
                  direction={direction}
                  displayName={displayName}
                  journalName={journalName}
                  onNext={goNext}
                  onPrev={goPrev}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

function StepWrapper({
  children,
  direction,
  stepKey,
}: {
  children: React.ReactNode;
  direction: number;
  stepKey: string;
}) {
  return (
    <motion.div
      key={stepKey}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitionSmooth}
      className="flex min-h-[320px] flex-col"
    >
      {children}
    </motion.div>
  );
}

function StepWelcome({
  direction,
  onNext,
}: {
  direction: number;
  onNext: () => void;
}) {
  return (
    <StepWrapper direction={direction} stepKey="welcome">
      <div className="flex flex-col gap-8 sm:flex-row-reverse sm:items-center sm:gap-12">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-neutral-100 sm:max-w-[280px] lg:max-w-xs">
          <Image
            src="https://images.unsplash.com/photo-1579017308347-e53e0d2fc5e9?w=500&auto=format&fit=crop&q=60"
            alt="Journaling"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 280px"
            priority
          />
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <motion.h1
            className="text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, ...transitionSmooth }}
          >
            Welcome to{" "}
            <span className="inline-block bg-linear-to-r from-blue-300 via-blue-600 to-blue-300 bg-clip-text font-medium text-transparent">
              Lumina
            </span>
          </motion.h1>
          <motion.p
            className="max-w-md text-[15px] leading-relaxed text-neutral-600"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, ...transitionSmooth }}
          >
            A calm space to track your mood and thoughts. Build a habit of
            reflection with gentle prompts and optional reminders.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...transitionSmooth }}
          >
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            >
              Get started
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </StepWrapper>
  );
}

function StepBasicInfo({
  direction,
  displayName,
  setDisplayName,
  onNext,
  onPrev,
}: {
  direction: number;
  displayName: string;
  setDisplayName: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <StepWrapper direction={direction} stepKey="basic">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 sm:text-2xl">
            Basic Information
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
            Tell us a bit about yourself so we can personalize your experience.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <label
            htmlFor="name"
            className="text-sm font-medium text-neutral-700"
          >
            Display name
          </label>
          <input
            id="name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 transition-colors duration-200 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400/30"
          />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </StepWrapper>
  );
}

function StepFirstJournal({
  direction,
  journalName,
  setJournalName,
  onNext,
  onPrev,
}: {
  direction: number;
  journalName: string;
  setJournalName: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <StepWrapper direction={direction} stepKey="journal">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 sm:text-2xl">
            Create your first journal
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
            Give your journal a name. You can create more later.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <label
            htmlFor="journal-name"
            className="text-sm font-medium text-neutral-700"
          >
            Journal name
          </label>
          <input
            id="journal-name"
            type="text"
            value={journalName}
            onChange={(e) => setJournalName(e.target.value)}
            placeholder="e.g. Daily reflections, Gratitude, Mood log"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 transition-colors duration-200 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400/30"
          />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </StepWrapper>
  );
}

const lineInputClass =
  "border-0 border-b border-neutral-300 bg-transparent px-1 py-0.5 text-neutral-900 rounded-none min-w-[3ch] focus:border-neutral-600 focus:outline-none transition-colors";

function InlineEditable({
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  "aria-label"?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!ref.current || document.activeElement === ref.current) return;
    if (ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const handleInput = () => {
    onChange(ref.current?.textContent ?? "");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  };

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel}
      data-placeholder={placeholder}
      className="inline-block min-w-[8ch] border-0 border-b border-neutral-300 bg-transparent px-1 py-0.5 text-neutral-900 rounded-none focus:border-neutral-600 focus:outline-none transition-colors [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-neutral-400"
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  );
}

function StepFirstEntry({
  direction,
  displayName,
  journalName,
  onNext,
  onPrev,
}: {
  direction: number;
  displayName: string;
  journalName: string;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [journalAbout, setJournalAbout] = useState("");
  const [lastWroteAbout, setLastWroteAbout] = useState("");
  const [mood, setMood] = useState("");
  const [goal, setGoal] = useState("");
  const [preferredHour, setPreferredHour] = useState("9");
  const [preferredMinute, setPreferredMinute] = useState("00");
  const [preferredPeriod, setPreferredPeriod] = useState<"AM" | "PM">("AM");
  const [whatBringsYou, setWhatBringsYou] = useState("");

  return (
    <StepWrapper direction={direction} stepKey="entry">
      <div className="flex flex-col gap-8">
        <div className="relative mx-auto max-w-2xl text-[17px] leading-8 text-neutral-700">
          <p className="mb-6">
            Hi, my name is{" "}
            <span className="font-medium text-neutral-900">
              {displayName || "..."}
            </span>
            . This is my first journal on{" "}
            <span className="inline-block bg-linear-to-r from-blue-300 via-blue-600 to-blue-300 bg-clip-text font-medium text-transparent">
              Lumina
            </span>
            {journalName ? (
              <> — I&apos;m calling it &ldquo;{journalName}&rdquo;.</>
            ) : (
              "."
            )}{" "}
            I like to journal about{" "}
            <InlineEditable
              value={journalAbout}
              onChange={setJournalAbout}
              placeholder="gratitude, daily wins, feelings"
              aria-label="What you like to journal about"
            />{" "}
            and the last thing I wrote about was{" "}
            <InlineEditable
              value={lastWroteAbout}
              onChange={setLastWroteAbout}
              placeholder="a trip, a hard day, a dream"
              aria-label="Last thing you wrote about"
            />
            . Right now I&apos;m feeling{" "}
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className={`${lineInputClass} cursor-pointer inline-block min-w-[8ch]`}
              aria-label="Current mood"
            >
              <option value="">—</option>
              {MOOD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>{" "}
            and my journaling goal is{" "}
            <InlineEditable
              value={goal}
              onChange={setGoal}
              placeholder="reflect daily, track mood"
              aria-label="Your journaling goal"
            />
            . I like to journal at{" "}
            <input
              type="text"
              inputMode="numeric"
              value={preferredHour}
              onChange={(e) =>
                setPreferredHour(e.target.value.replace(/\D/g, "").slice(0, 2))
              }
              placeholder="9"
              className={`${lineInputClass} w-10 text-center inline-block`}
              aria-label="Hour"
            />
            :
            <input
              type="text"
              inputMode="numeric"
              value={preferredMinute}
              onChange={(e) =>
                setPreferredMinute(
                  e.target.value.replace(/\D/g, "").slice(0, 2),
                )
              }
              placeholder="00"
              className={`${lineInputClass} w-10 text-center inline-block`}
              aria-label="Minute"
            />{" "}
            <select
              value={preferredPeriod}
              onChange={(e) =>
                setPreferredPeriod(e.target.value as "AM" | "PM")
              }
              className={`${lineInputClass} w-14 cursor-pointer inline-block h-9`}
              aria-label="AM or PM"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
            .
          </p>
          <p>
            What brings me to Lumina:{" "}
            <InlineEditable
              value={whatBringsYou}
              onChange={setWhatBringsYou}
              placeholder="I want to understand my patterns, make space for reflection…"
              aria-label="What brings you to Lumina (optional)"
            />
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          >
            Finish
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </StepWrapper>
  );
}

export default OnboardPage;
