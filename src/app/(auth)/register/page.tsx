// src/app/(auth)/register/page.tsx

import { RegisterForm } from "@/components/features/RegisterForm";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Shield,
  Palette,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Fondo animado con gradiente */}
      <div className="absolute inset-0 bg-linear-to-br from-accent/10 via-background to-primary/5" />

      {/* Patrón de puntos decorativo */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Formas decorativas flotantes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 flex flex-1">
        {/* Panel izquierdo - Información */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-xl space-y-8">
            {/* Logo y título */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left duration-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">Kustom</h1>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Únete a la comunidad de creadores
              </h2>
              <p className="text-lg text-muted-foreground">
                Comienza a diseñar productos únicos y da vida a tu creatividad
                con herramientas potenciadas por IA.
              </p>
            </div>

            {/* Features destacados */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left duration-700 delay-200">
              <FeatureItem
                icon={<Sparkles className="w-5 h-5" />}
                title="Gratis para empezar"
                description="Crea tu cuenta sin costo y explora todas las funciones"
              />
              <FeatureItem
                icon={<Palette className="w-5 h-5" />}
                title="Diseños ilimitados"
                description="Sin límites en tu creatividad, crea todo lo que imagines"
              />
              <FeatureItem
                icon={<Zap className="w-5 h-5" />}
                title="IA integrada"
                description="Asistente inteligente que te ayuda en cada paso"
              />
            </div>

            {/* Beneficios de registro */}
            <div className="p-6 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-border/50 animate-in fade-in slide-in-from-left duration-700 delay-300">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                ¿Qué obtienes al registrarte?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Acceso completo a todas las herramientas de diseño
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Visualización 3D de tus creaciones
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Soporte prioritario de nuestro equipo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Plantillas exclusivas y recursos premium
                </li>
              </ul>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 pt-6 animate-in fade-in slide-in-from-left duration-700 delay-400">
              <StatItem value="10K+" label="Creadores" />
              <StatItem value="50K+" label="Diseños" />
              <StatItem value="4.9★" label="Rating" />
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Header mobile */}
            <div className="text-center lg:hidden space-y-2 animate-in fade-in slide-in-from-top duration-700">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Kustom</h1>
              </div>
              <h2 className="text-2xl font-bold">¡Únete a Kustom!</h2>
              <p className="text-sm text-muted-foreground">
                Crea tu cuenta y comienza a diseñar
              </p>
            </div>

            {/* Formulario */}
            <RegisterForm />

            {/* Links adicionales */}
            <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom duration-700 delay-500">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>

              <p className="text-xs text-muted-foreground px-4">
                Al registrarte, aceptas nuestros{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-foreground transition-colors"
                >
                  Términos de Servicio
                </Link>{" "}
                y{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-foreground transition-colors"
                >
                  Política de Privacidad
                </Link>
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 pt-6 animate-in fade-in duration-700 delay-700">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% Seguro</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>+10K usuarios</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="shrink-0 p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
        <div className="text-primary">{icon}</div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-colors">
      <div className="text-2xl font-bold text-primary mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
