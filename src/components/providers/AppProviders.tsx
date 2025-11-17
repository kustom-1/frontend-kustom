// src/components/providers/AppProviders.tsx

"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionLoader } from "./SessionLoader";
import { Toaster } from "@/components/ui/sonner"; // <-- 1. Importar Sonner

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionLoader>
          {children}
          <Toaster position="top-right" richColors /> {/* <-- 2. Añadir Toaster */}
        </SessionLoader>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
