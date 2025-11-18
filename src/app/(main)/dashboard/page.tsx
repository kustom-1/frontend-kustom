// src/app/(main)/dashboard/page.tsx

"use client"; // La haremos cliente para usar el hook de Redux

import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  LayoutGrid,
  Shirt,
  Shield,
  Sparkles,
  Users,
  Warehouse,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { permissions, isLoading } = usePermissions();

  const links = [
    {
      title: "Usuarios",
      description: "Crea, edita y gestiona cuentas.",
      href: "/dashboard/users",
      icon: Users,
      canShow: permissions.canReadUsers,
    },
    {
      title: "Roles y permisos",
      description: "Controla el acceso y las capacidades.",
      href: "/dashboard/roles",
      icon: Shield,
      canShow: permissions.canReadRoles,
    },
    {
      title: "Categorías",
      description: "Organiza el catálogo por colecciones.",
      href: "/dashboard/categories",
      icon: LayoutGrid,
      canShow: permissions.canReadCategories,
    },
    {
      title: "Prendas",
      description: "Gestiona inventario e información básica.",
      href: "/dashboard/cloths",
      icon: Shirt,
      canShow: permissions.canReadCloths,
    },
    {
      title: "Inventario (Stock)",
      description: "Mantén existencias y movimientos al día.",
      href: "/dashboard/stocks",
      icon: Warehouse,
      canShow: permissions.canReadStocks,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Panel principal
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¡Bienvenido, {user?.firstName || "Usuario"}!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Accede rápido a las secciones clave del panel. Gestiona usuarios,
              roles, catálogo y stock desde un solo lugar.
            </p>
          </div>
          <div className="rounded-2xl border bg-background/60 px-4 py-3 shadow-sm">
            <p className="text-sm text-muted-foreground">Estado</p>
            <p className="text-base font-semibold text-primary">Todo listo</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Accesos rápidos</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los diferentes aspectos de tu plataforma de manera
            eficiente.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="h-full">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {links
              .filter((link) => link.canShow)
              .map(({ title, description, href, icon: Icon }) => (
                <Card
                  key={href}
                  className="group relative h-full overflow-hidden border hover:shadow-lg transition"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <CardTitle>{title}</CardTitle>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                    </div>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10"
                    >
                      Ir a {title}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
