// src/components/common/Navbar.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { authService } from "@/services/auth.service";
import { logoutUser } from "@/store/slices/authSlice";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user, loading } = useAppSelector(
    (state) => state.auth
  );

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logoutUser());
      toast.success("Has cerrado sesión exitosamente.");
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Hubo un problema al cerrar tu sesión.");
    }
  };

  const renderAuthLinks = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-4">
          {/* * AJUSTE 1: Añadido 'font-medium' para igualar el peso del texto de los botones.
           */}
          <span className="text-sm font-medium text-muted-foreground">
            Hola, {user.firstName}
          </span>
          {/* * AJUSTE 2: Añadido 'className' para forzar el color del texto.
           */}
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-muted-foreground" // <-- AJUSTE 2
          >
            Cerrar Sesión
          </Button>
        </div>
      );
    }

    // Botones para usuarios no autenticados
    return (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          asChild
          className="text-muted-foreground" // <-- AJUSTE 2
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Empezar</Link>
        </Button>
      </div>
    );
  };

  return (
    <nav className="flex items-center justify-between p-4 px-8 border-b bg-background">
      <Link href="/" className="text-2xl font-bold text-primary">
        Kustom
      </Link>
      {renderAuthLinks()}
    </nav>
  );
}
