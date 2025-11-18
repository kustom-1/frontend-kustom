// src/app/(auth)/login/page.tsx

import { LoginForm } from "@/components/features/LoginForm";
import Link from "next/link";
import { Sparkles, Zap, Shield, Palette } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Fondo animado con gradiente */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/10" />

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
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-500" />

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
                Bienvenido de vuelta a tu espacio creativo
              </h2>
              <p className="text-lg text-muted-foreground">
                Inicia sesión para continuar creando diseños únicos y dar vida a
                tus ideas.
              </p>
            </div>

            {/* Features destacados */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left duration-700 delay-200">
              <FeatureItem
                icon={<Zap className="w-5 h-5" />}
                title="Diseño rápido"
                description="Crea productos personalizados en minutos"
              />
              <FeatureItem
                icon={<Palette className="w-5 h-5" />}
                title="IA creativa"
                description="Asistencia inteligente para tus diseños"
              />
              <FeatureItem
                icon={<Shield className="w-5 h-5" />}
                title="100% seguro"
                description="Tus datos protegidos con encriptación"
              />
            </div>

            {/* Testimonial */}
            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 animate-in fade-in slide-in-from-left duration-700 delay-300">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    MR
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm italic text-muted-foreground mb-2">
                    "Kustom ha transformado completamente la forma en que creo
                    mis productos personalizados. ¡Es increíble!"
                  </p>
                  <p className="text-sm font-semibold">María Rodríguez</p>
                  <p className="text-xs text-muted-foreground">
                    Diseñadora independiente
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 pt-6 animate-in fade-in slide-in-from-left duration-700 delay-400">
              {/* <StatItem value="10K+" label="Usuarios" /> */}
              <StatItem value="Low" label="Cost" />
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
              <h2 className="text-2xl font-bold">¡Bienvenido de vuelta!</h2>
              <p className="text-sm text-muted-foreground">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Formulario */}
            <LoginForm />

            {/* Links adicionales */}
            <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom duration-700 delay-500">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  Regístrate gratis
                </Link>
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ¿Problemas para acceder?
                  </span>
                </div>
              </div>

              <Link
                href="/forgot-password"
                className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Recuperar contraseña
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 pt-6 animate-in fade-in duration-700 delay-700">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>Conexión segura</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Datos encriptados</span>
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
