// src/app/(main)/dashboard/layout.tsx

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/40 flex-col md:flex-row">
      {/* El Sidebar será fijo */}
      <Sidebar />

      {/* El contenido principal del dashboard */}
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
