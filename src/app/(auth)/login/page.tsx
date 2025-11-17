// src/app/(auth)/login/page.tsx

import { LoginForm } from "@/components/features/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="underline text-primary">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
