"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Torus } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Componente de la escena 3D
 * Usamos un Torus (dona) como placeholder para la camisa
 */
function Scene3D() {
  const meshRef = useRef<Mesh>(null!);

  // Animación simple: rotar el objeto en cada frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
      {/* Luces */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />

      {/* Objeto 3D */}
      <Torus ref={meshRef} args={[1.5, 0.4, 32, 100]}>
        <meshStandardMaterial color="oklch(var(--primary))" />
      </Torus>

      {/* Controles de cámara (orbitar, zoom) */}
      <OrbitControls enableZoom={true} />
    </>
  );
}

/**
 * Página de Landing
 */
export default function LandingPage() {
  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden">
      {/* Fondo con la escena 3D */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Scene3D />
        </Canvas>
      </div>

      {/* Contenido Superpuesto */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4 bg-black/30 backdrop-blur-sm">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Diseña tu Estilo con IA
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl text-foreground/80">
          Personaliza camisas y más con nuestro visualizador 3D y la potencia de
          la inteligencia artificial.
        </p>
        <Button size="lg" asChild className="text-lg">
          <Link href="/register">Comienza a Crear Ahora</Link>
        </Button>
      </div>
    </div>
  );
}
