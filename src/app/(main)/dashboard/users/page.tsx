// src/app/(main)/dashboard/users/page.tsx

import { UserClient } from "@/components/features/users/UserClient"; // Importar
import React from "react";

export default async function UsersPage() {
  return (
    <div className="w-full">
      <UserClient />
    </div>
  );
}
