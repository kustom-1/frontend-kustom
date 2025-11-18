// src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Shield,
  ShieldAlert,
  LayoutGrid,
  Shirt,
  Warehouse,
  Menu,
  ImageIcon,
} from "lucide-react"; // <-- Importar ShieldAlert
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
function SidebarError({
  error,
  className,
}: {
  error: any;
  className?: string;
}) {
  let title = "Error de permisos";

  if (error?.response?.status === 403) {
    title = "Acceso Denegado";
  }

  return (
    <div className={cn("p-4 text-center", className)}>
      <ShieldAlert className="w-6 h-6 mx-auto text-destructive" />
      <p className="mt-2 text-sm font-semibold text-destructive">{title}</p>
      <p className="text-xs text-muted-foreground">
        No hay permisos suficientes para estar aqui.
      </p>
    </div>
  );
}

export function Sidebar() {
  const { permissions, isLoading, error } = usePermissions(); // <-- Capturar error

  const renderNavContent = () => {
    return (
      <div className="flex-1 overflow-auto py-2 px-4 text-sm font-medium">
        <NavLink href="/dashboard" icon={Home}>
          Inicio
        </NavLink>

        {isLoading && (
          <div className="space-y-2 mt-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {!isLoading && error && <SidebarError error={error} className="mt-2" />}

        {!isLoading && !error && (
          <>
            {permissions.canReadUsers && (
              <NavLink href="/dashboard/users" icon={Users}>
                Usuarios
              </NavLink>
            )}

            {permissions.canReadRoles && (
              <NavLink href="/dashboard/roles" icon={Shield}>
                Roles y Permisos
              </NavLink>
            )}

            {permissions.canReadCategories && (
              <NavLink href="/dashboard/categories" icon={LayoutGrid}>
                Categorías
              </NavLink>
            )}

            {permissions.canReadCloths && (
              <NavLink href="/dashboard/cloths" icon={Shirt}>
                Prendas
              </NavLink>
            )}

            {permissions.canReadStocks && (
              <NavLink href="/dashboard/stocks" icon={Warehouse}>
                Inventario (Stock)
              </NavLink>
            )}

            {permissions.canReadImages && (
              <NavLink href="/dashboard/images" icon={ImageIcon}>
                Galería (S3)
              </NavLink>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Navegación móvil: botón + sheet deslizante */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
        <Link href="/dashboard" className="text-lg font-semibold text-primary">
          Dashboard
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Abrir menú del dashboard"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="text-primary">Dashboard</SheetTitle>
            </SheetHeader>
            <nav className="flex-1">{renderNavContent()}</nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Navegación de escritorio */}
      <aside className="hidden w-64 border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Dashboard
            </Link>
          </div>
          <nav className="flex-1">{renderNavContent()}</nav>
        </div>
      </aside>
    </>
  );
}
