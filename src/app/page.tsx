"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Icosahedron, Torus } from "@react-three/drei";
import { useRef, useEffect, Suspense, useState } from "react";
import { Group, Color, Vector2 } from "three";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { animate, stagger } from "animejs";
import {
  Gem,
  Sparkles,
  Palette,
  Bot,
  ArrowRight,
  Zap,
  Heart,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInView } from "react-intersection-observer";
import { easing } from "maath";

function Animated3DScene() {
  const meshRef = useRef<Group>(null!);
  const { pointer } = useThree();
  const [colors, setColors] = useState({
    primary: new Color(0x37352f),
    accent: new Color(0xf7f6f3),
    secondary: new Color(0xf7f6f3),
  });

  useEffect(() => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    document.body.appendChild(tempDiv);

    tempDiv.className = "bg-primary";
    const primaryColor = getComputedStyle(tempDiv).backgroundColor;

    tempDiv.className = "bg-accent";
    const accentColor = getComputedStyle(tempDiv).backgroundColor;

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
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x += delta * 0.03;
    }

    easing.damp3(
      state.camera.position,
      [
        Math.sin(pointer.x * Math.PI) * 2,
        pointer.y * 2,
        Math.cos(pointer.x * Math.PI) * 2 + 8,
      ],
      0.2,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={meshRef}>
      <Icosahedron args={[1.5, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={colors.primary}
          metalness={0.3}
          roughness={0.4}
        />
      </Icosahedron>

      <Torus args={[2.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={colors.accent} />
      </Torus>
      <Torus args={[2.8, 0.05, 16, 100]} rotation={[Math.PI / 2, 0.3, 0]}>
        <meshStandardMaterial color={colors.accent} />
      </Torus>

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
  const pRef = useRef<HTMLParagraphElement | null>(null);

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
      ref={(el) => {
        ref(el);
        pRef.current = el;
      }}
      className="text-xl md:text-2xl mb-8 max-w-2xl text-white/90 opacity-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    >
      {text}
    </p>
  );
}

function AnimatedButton({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const btnRef = useRef<HTMLDivElement | null>(null);

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
    <div
      ref={(el) => {
        ref(el);
        btnRef.current = el;
      }}
      className="inline-block opacity-0"
    >
      {children}
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
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

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

const galleryItems = [
  {
    id: 1,
    title: "Japon al alcance un click",
    image:
      "https://images.unsplash.com/photo-1627913363993-95b23378265e?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Kustom Osaka t-shirt",
  },
  {
    id: 2,
    title: "Camiseta con Diseño Único",
    image:
      "https://images.unsplash.com/photo-1627913364248-344231dd2451?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Impresión DTG de gran detalle y creatividad",
  },
  {
    id: 3,
    title: "Máxima calidad",
    image:
      "https://images.unsplash.com/photo-1627913364116-f553103253a2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Texto personalizado, colores contrastantes para destacar",
  },
];

function AnimatedIconCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: any;
  title: string;
  description: string;
  index: number;
}) {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    if (inView) {
      animate(cardRef.current, {
        opacity: [0, 1],
        y: [24, 0],
        scale: [0.96, 1],
        ease: "outCubic",
        duration: 700,
        delay: index * 140,
      });
    } else {
      animate(cardRef.current, {
        opacity: 0.7,
        y: 12,
        scale: 0.98,
        ease: "inCubic",
        duration: 400,
      });
    }
  }, [inView, index]);

  return (
    <div ref={ref}>
      <div
        ref={cardRef}
        className="
          relative p-8 rounded-2xl bg-card/80 border border-border/20 
          backdrop-blur-sm 
          hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl
          transition-all duration-300 ease-out
          opacity-0 will-change-transform
          h-full flex flex-col items-center text-center
        "
      >
        <div className="mb-4 p-4 rounded-full bg-primary/10">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

function GalleryCard({
  item,
  index,
}: {
  item: (typeof galleryItems)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(cardRef.current!, {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.95, 1],
            easing: "out(3)",
            duration: 600,
            delay: index * 80,
          });
        } else {
          animate(cardRef.current!, {
            opacity: [1, 0],
            translateY: [0, 30],
            scale: [1, 0.95],
            easing: "in(3)",
            duration: 400,
          });
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 opacity-0"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <h3 className="font-bold text-xl mb-1">{item.title}</h3>
            <p className="text-sm text-white/90">{item.description}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Hero Section - Fixed */}
      <section className="fixed inset-0 w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-black" />}>
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              <Animated3DScene />
            </Canvas>
          </Suspense>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4 bg-linear-to-b from-black/40 via-black/30 to-black/50">
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

      {/* Spacer */}
      <div className="h-screen" />

      {/* Features Section */}
      <section className="sticky top-[60px] z-10 h-[calc(100vh)] py-8 md:py-12 px-4 bg-background  -mt-8 overflow-y-auto md:overflow-hidden">
        <div className="container mx-auto w-full md:h-full md:flex md:flex-col md:justify-center">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">
              Todo lo que necesitas para ser único
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto px-4">
              Nuestra plataforma te da el poder de diseñar sin esfuerzo y con
              resultados espectaculares.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pb-8 md:pb-0">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="sticky top-[60px] z-20 h-[calc(100vh)] py-8 md:py-12 px-4 bg-accent/95 backdrop-blur-sm  -mt-8 overflow-y-auto md:overflow-hidden">
        <div className="container mx-auto w-full md:h-full md:flex md:flex-col md:justify-center">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">
              Tu Imaginación es el Límite
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto px-4">
              Inspírate con algunos de los diseños creados por nuestra
              comunidad.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8 md:pb-0">
            {galleryItems.map((item, index) => (
              <GalleryCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="sticky top-[60px] z-30 h-[calc(100vh)] py-8 md:py-12 px-4 bg-background  -mt-8 overflow-y-auto md:overflow-hidden">
        <div className="container mx-auto max-w-6xl w-full md:h-full md:flex md:flex-col md:justify-center">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-4">
              ¿Listo para dar vida a tus ideas?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto px-4">
              Únete a miles de creadores que ya están diseñando productos únicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-10">
            <AnimatedIconCard
              icon={Zap}
              title="Rápido y Fácil"
              description="Diseños profesionales en minutos"
              index={0}
            />
            <AnimatedIconCard
              icon={Heart}
              title="Hecho con Amor"
              description="Productos fabricados con cuidado"
              index={1}
            />
            <AnimatedIconCard
              icon={Star}
              title="Calidad Superior"
              description="Materiales premium garantizados"
              index={2}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4 pb-8 md:pb-0">
            <Button
              size="lg"
              asChild
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 group w-full sm:w-auto"
            >
              <Link href="/register" className="flex items-center gap-2">
                Comienza Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
            >
              <Link href="/gallery">Ver Galería</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-40 py-6 md:py-8 px-4 border-t border-border/20 bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-sm md:text-base">
            &copy; {new Date().getFullYear()} Kustom. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
