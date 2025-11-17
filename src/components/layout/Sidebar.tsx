// src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Shield, ShieldAlert } from "lucide-react"; // <-- Importar ShieldAlert
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Componente helper NavLink (sin cambios)
function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

// Componente helper para mostrar el error
function SidebarError({ error }: { error: any }) {
  let title = "Error de permisos";

  if (error?.response?.status === 403) {
    title = "Acceso Denegado";
  }

  return (
    <div className="px-4 text-center">
      <ShieldAlert className="w-6 h-6 mx-auto text-destructive" />
      <p className="mt-2 text-sm font-semibold text-destructive">{title}</p>
      <p className="text-xs text-muted-foreground">
        No se pudieron cargar tus permisos.
      </p>
    </div>
  );
}

export function Sidebar() {
  const { permissions, isLoading, error } = usePermissions(); // <-- Capturar error

  return (
    <aside className="hidden w-64 border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Dashboard
          </Link>
        </div>

        <nav className="flex-1 overflow-auto py-2 px-4 text-sm font-medium">
          {/* Enlace general (todos lo ven) */}
          <NavLink href="/dashboard" icon={Home}>
            Inicio
          </NavLink>

          {/* --- Renderizado Condicional (RBAC) --- */}

          {isLoading && (
            // Skeleton mientras cargan los permisos
            <div className="space-y-2 mt-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}

          {!isLoading && error && (
            // Estado de Error (403 o 500)
            <SidebarError error={error} />
          )}

          {!isLoading && !error && (
            // Estado de Éxito
            <>
              {/* Solo se muestra si el usuario puede LEER usuarios */}
              {permissions.canReadUsers && (
                <NavLink href="/dashboard/users" icon={Users}>
                  Usuarios
                </NavLink>
              )}

              {/* Solo se muestra si el usuario puede LEER roles */}
              {permissions.canReadRoles && (
                <NavLink href="/dashboard/roles" icon={Shield}>
                  Roles y Permisos
                </NavLink>
              )}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
