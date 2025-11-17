// src/app/(main)/dashboard/page.tsx

"use client"; // La haremos cliente para usar el hook de Redux

import { useAppSelector } from "@/lib/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  // Obtenemos el usuario del estado de Redux
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          ¡Bienvenido, {user?.firstName || "Usuario"}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Aquí tienes un resumen de la plataforma.
        </p>
      </div>

      {/* A futuro, aquí pondremos 'Cards' con resúmenes
        ej. (Nuevos Pedidos, Total de Usuarios, etc.)
      */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gestiona los usuarios de la plataforma.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Define los permisos para cada rol.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximamente...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nuevas entidades (Productos, Pedidos...).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
