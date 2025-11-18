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
import { UserRole } from "@/lib/definitions";
import { LayoutDashboard, LogOut, ShoppingCart } from "lucide-react";

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
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      );
    }

    if (isAuthenticated && user) {
      const canSeeDashboard =
        user.role === UserRole.Coordinador || user.role === UserRole.Auxiliar;

      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
            Hola, {user.firstName}
          </span>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground"
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>

          {canSeeDashboard && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden text-muted-foreground"
                asChild
                aria-label="Ir al dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-muted-foreground"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="ml-2">Dashboard</span>
                </Link>
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={handleLogout}
            size="icon"
            className="sm:hidden text-muted-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="hidden sm:inline-flex text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Cerrar sesión</span>
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
    <div className="sticky top-0 z-60 bg-background/80 backdrop-blur border-b">
      <nav className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-0 md:h-[60px]">
        <Link href="/" className="text-2xl font-bold text-primary">
          Kustom
        </Link>
        {renderAuthLinks()}
      </nav>
    </div>
  );
}
