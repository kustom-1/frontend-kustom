"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Icosahedron, Torus } from "@react-three/drei";
import { useRef, useEffect, Suspense, useState } from "react";
import { Group, Color } from "three";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { Gem, Sparkles, Palette, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInView } from "react-intersection-observer";
import { easing } from "maath";

function Animated3DScene() {
  const meshRef = useRef<Group>(null!);
  const { mouse } = useThree();
  const [colors, setColors] = useState({
    primary: new Color(0x37352f),
    accent: new Color(0xf7f6f3),
    secondary: new Color(0xf7f6f3),
  });

  useEffect(() => {
    // Crear elementos temporales para leer los colores computados
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    document.body.appendChild(tempDiv);

    // Leer primary
    tempDiv.className = "bg-primary";
    const primaryColor = getComputedStyle(tempDiv).backgroundColor;

    // Leer accent
    tempDiv.className = "bg-accent";
    const accentColor = getComputedStyle(tempDiv).backgroundColor;

    // Leer secondary
    tempDiv.className = "bg-secondary";
    const secondaryColor = getComputedStyle(tempDiv).backgroundColor;

    document.body.removeChild(tempDiv);

    setColors({
      primary: new Color(primaryColor),
      accent: new Color(accentColor),
      secondary: new Color(secondaryColor),
    });
  }, []);

  useFrame((state, delta) => {
    // Animación de rotación sutil
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x += delta * 0.03;
    }

    // Mover la cámara ligeramente con el mouse para un efecto parallax
    easing.damp3(
      state.camera.position,
      [
        Math.sin(mouse.x * Math.PI) * 2,
        mouse.y * 2,
        Math.cos(mouse.x * Math.PI) * 2 + 8,
      ],
      0.2,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={meshRef}>
      {/* Objeto principal */}
      <Icosahedron args={[1.5, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={colors.primary}
          metalness={0.3}
          roughness={0.4}
        />
      </Icosahedron>

      {/* Anillos decorativos */}
      <Torus args={[2.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={colors.accent} />
      </Torus>
      <Torus args={[2.8, 0.05, 16, 100]} rotation={[Math.PI / 2, 0.3, 0]}>
        <meshStandardMaterial color={colors.accent} />
      </Torus>

      {/* Partículas flotantes */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Icosahedron
          key={i}
          args={[0.1, 0]}
          position={[
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
          ]}
        >
          <meshStandardMaterial
            color={colors.secondary}
            metalness={0.1}
            roughness={0.8}
            transparent
            opacity={0.7}
          />
        </Icosahedron>
      ))}
    </group>
  );
}

function AnimatedTitle({ text }: { text: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (inView && titleRef.current) {
      const letters = titleRef.current.textContent?.split("") || [];
      titleRef.current.innerHTML = letters
        .map(
          (letter) =>
            `<span class="letter inline-block opacity-0">${
              letter === " " ? "&nbsp;" : letter
            }</span>`
        )
        .join("");

      animate(titleRef.current.querySelectorAll(".letter"), {
        translateY: [100, 0],
        opacity: [0, 1],
        translateZ: 0,
        easing: "out(4)",
        duration: 1400,
        delay: stagger(30, { start: 300 }),
      });
    }
  }, [inView]);

  return (
    <h1
      ref={ref}
      className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
    >
      <span ref={titleRef}>{text}</span>
    </h1>
  );
}

function AnimatedParagraph({ text }: { text: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const pRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (inView && pRef.current) {
      animate(pRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        easing: "out(4)",
        duration: 1200,
        delay: 800,
      });
    }
  }, [inView]);

  return (
    <p
      ref={ref}
      className="text-xl md:text-2xl mb-8 max-w-2xl text-white/90 opacity-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    >
      <span ref={pRef}>{text}</span>
    </p>
  );
}

function AnimatedButton({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView && btnRef.current) {
      animate(btnRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        easing: "out(4)",
        duration: 1200,
        delay: 1200,
      });
    }
  }, [inView]);

  return (
    <div ref={ref} className="opacity-0">
      <div ref={btnRef}>{children}</div>
    </div>
  );
}

const features = [
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: "Diseño Asistido por IA",
    description:
      "Nuestra IA interpreta tus ideas y las convierte en diseños únicos para tus productos.",
  },
  {
    icon: <Gem className="w-8 h-8 text-primary" />,
    title: "Visualización 3D Interactiva",
    description:
      "Observa tu creación en 3D desde todos los ángulos antes de tomar una decisión.",
  },
  {
    icon: <Palette className="w-8 h-8 text-primary" />,
    title: "Personalización sin Límites",
    description:
      "Ajusta colores, texturas y estilos con una interfaz intuitiva y potente.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "Calidad Premium",
    description:
      "Materiales de alta calidad para que tu producto final sea tan bueno como el diseño.",
  },
];

function FeatureCard({
  icon,
  title,
  description,
  index,
}: (typeof features)[0] & { index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/20 h-full">
        <CardHeader className="flex flex-row items-center gap-4">
          {icon}
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Datos de ejemplo para la galería
const galleryItems = [
  {
    id: 1,
    title: "Taza Personalizada Galaxia",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop",
    description: "Diseño de galaxia en tonos morados y azules",
  },
  {
    id: 2,
    title: "Camiseta Geométrica",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    description: "Patrón geométrico minimalista",
  },
  {
    id: 3,
    title: "Funda Floral Vintage",
    image:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
    description: "Estampado floral con estilo retro",
  },
  {
    id: 4,
    title: "Sudadera Abstracta",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop",
    description: "Arte abstracto en colores vibrantes",
  },
  {
    id: 5,
    title: "Gorra Urbana",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop",
    description: "Diseño urbano con tipografía moderna",
  },
  {
    id: 6,
    title: "Botella Naturaleza",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
    description: "Ilustración de paisaje natural",
  },
];

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-black" />}>
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              <Animated3DScene />
            </Canvas>
          </Suspense>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4 bg-gradient-to-b from-black/40 via-black/30 to-black/50">
          <AnimatedTitle text="Crea, Visualiza, Materializa." />
          <AnimatedParagraph text="Transforma tus ideas en productos reales. Personaliza con la magia de la IA y visualiza tus diseños en 3D al instante." />
          <AnimatedButton>
            <Button
              size="lg"
              asChild
              className="text-lg shadow-lg shadow-primary/20"
            >
              <Link href="/register">Empieza a Crear Gratis</Link>
            </Button>
          </AnimatedButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">
            Todo lo que necesitas para ser único
          </h2>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            Nuestra plataforma te da el poder de diseñar sin esfuerzo y con
            resultados espectaculares.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="text-center mb-12 container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold">
            Tu Imaginación es el Límite
          </h2>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            Inspírate con algunos de los diseños creados por nuestra comunidad.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto">
          {galleryItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden group bg-background/50 border-border/20 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-sm text-white/80">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 text-center container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          ¿Listo para dar vida a tus ideas?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Únete a miles de creadores que ya están diseñando el futuro.
        </p>
        <Button size="lg" asChild className="text-lg animate-pulse">
          <Link href="/register">Comienza a Crear Ahora</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/20 bg-card/30">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Kustom. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
