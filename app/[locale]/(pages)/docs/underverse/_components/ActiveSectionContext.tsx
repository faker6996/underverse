"use client";

import React, { createContext, useContext, useState } from "react";

interface ActiveSectionContextType {
  activeId: string;
  setActiveId: (id: string) => void;
}

const ActiveSectionContext = createContext<ActiveSectionContextType>({
  activeId: "",
  setActiveId: () => {},
});

export function ActiveSectionProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string>("");

  return (
    <ActiveSectionContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSection() {
  return useContext(ActiveSectionContext);
}
