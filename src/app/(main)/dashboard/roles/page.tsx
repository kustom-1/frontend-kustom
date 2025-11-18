// src/app/(main)/dashboard/roles/page.tsx

import { RoleClient } from "@/components/features/roles/RoleClient"; // <-- Importar
import React from "react";

export default async function RolesPage() {
  return (
    <div className="w-full">
      {/* Reemplazamos el placeholder con el componente real */}
      <RoleClient />
    </div>
  );
}
