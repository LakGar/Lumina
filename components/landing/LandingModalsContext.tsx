"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { ContactModal } from "./ContactModal";
import { WaitlistModal } from "./WaitlistModal";

type LandingModalsContextValue = {
  openContactModal: () => void;
  openWaitlistModal: (source?: string) => void;
};

const LandingModalsContext = createContext<LandingModalsContextValue | null>(null);

export function useLandingModals() {
  const ctx = useContext(LandingModalsContext);
  return ctx;
}

export function LandingModalsProvider({ children }: { children: React.ReactNode }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState<string | undefined>();

  const openContactModal = useCallback(() => setContactOpen(true), []);
  const openWaitlistModal = useCallback((source?: string) => {
    setWaitlistSource(source);
    setWaitlistOpen(true);
  }, []);

  return (
    <LandingModalsContext.Provider value={{ openContactModal, openWaitlistModal }}>
      {children}
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        source={waitlistSource}
      />
    </LandingModalsContext.Provider>
  );
}
