import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { AppProviders } from "@/components/providers/AppProviders"; // 1. Importar el nuevo wrapper
import Navbar from "@/components/common/Navbar"; // 3. Añadido para la UI base
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

// 4. Se eliminó la creación de `new QueryClient()` de aquí
// 5. Se eliminó la importación de `@/store/provider` (o Providers)
export const metadata: Metadata = {
  title: "Kustom AI",
  description: "Personaliza tu ropa con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 6. Usamos el wrapper "use client" que contiene toda la lógica */}
        <AppProviders>
          <Navbar />
          <main>{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
