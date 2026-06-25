"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

interface ReadOnlyContextType {
  isReadOnly: boolean;
  isTeknisi: boolean;
}

const ReadOnlyContext = createContext<ReadOnlyContextType>({
  isReadOnly: false,
  isTeknisi: false,
});

export function ReadOnlyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const value = useMemo(() => ({
    isReadOnly: user?.role === "Teknisi",
    isTeknisi: user?.role === "Teknisi",
  }), [user?.role]);

  return (
    <ReadOnlyContext.Provider value={value}>
      {children}
    </ReadOnlyContext.Provider>
  );
}

export function useReadOnly() {
  const ctx = useContext(ReadOnlyContext);
  if (!ctx) throw new Error("useReadOnly must be used inside ReadOnlyProvider");
  return ctx;
}
