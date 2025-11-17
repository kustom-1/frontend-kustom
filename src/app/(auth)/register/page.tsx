// src/app/(auth)/register/page.tsx

import { RegisterForm } from "@/components/features/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline text-primary">
          Inicia Sesión
        </Link>
      </p>
    </div>
  );
}
