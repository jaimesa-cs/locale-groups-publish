"use client";

import React from "react";
import useEntrySidebarExtensionContext from "../providers/EntrySidebarExtensionProvider";

type UseEntrySidebarExtensionContextType = ReturnType<
  typeof useEntrySidebarExtensionContext
>;

const EntrySidebarExtensionContext =
  React.createContext<UseEntrySidebarExtensionContextType | null>(null);

const ExtensionProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useEntrySidebarExtensionContext();
  return (
    <EntrySidebarExtensionContext.Provider value={value}>
      {children}
    </EntrySidebarExtensionContext.Provider>
  );
};

export const useSidebarContext = () =>
  React.useContext(EntrySidebarExtensionContext)!;

export default ExtensionProvider;
