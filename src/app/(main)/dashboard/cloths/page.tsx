// src/app/(main)/dashboard/cloths/page.tsx

import { ClothClient } from "@/components/features/cloths/ClothClient"; // <-- Importar
import React from "react";

export default async function ClothsPage() {
  return (
    <div className="w-full">
      {/* Reemplazamos el placeholder con el componente real */}
      <ClothClient />
    </div>
  );
}
