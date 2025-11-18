// src/app/(main)/customize/page.tsx

"use client";

import { useCallback, useMemo, useState } from "react";
import { ShirtCanvas } from "@/components/features/customizer/ShirtCanvas";
import { CustomizerControls } from "@/components/features/customizer/CustomizerControls";
import type {
  CustomizationPayload,
  DecalState,
  SurfacePickResult,
  Vector3Tuple,
} from "@/lib/definitions";
import { toast } from "sonner";
import { imageService } from "@/services/image.service";

// --- Lógica de la POC (copiada 1:1) ---

const createDefaultDecal = (): DecalState => ({
  imageUrl: "/logo.png",
  position: [0, 0.15, 0.08],
  rotation: [0, 0, 0],
  scale: 0.35,
  aspectRatio: 1,
});

const POSITION_LIMITS: Record<"x" | "y" | "z", { min: number; max: number }> = {
  x: { min: -0.35, max: 0.35 },
  y: { min: 0, max: 0.45 },
  z: { min: -0.2, max: 0.2 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

async function readFileAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Función helper para obtener dimensiones (útil para el aspectRatio)
async function measureImageAspectRatio(src: string) {
  return new Promise<number>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (!image.width || !image.height) {
        resolve(1);
        return;
      }
      resolve(image.width / image.height || 1);
    };
    image.onerror = reject;
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

export default function CustomizePage() {
  const [decal, setDecal] = useState<DecalState>(() => createDefaultDecal());
  const [baseColor, setBaseColor] = useState("#ffffff");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleSurfacePick = useCallback((payload: SurfacePickResult) => {
    if (!payload) return;
    setDecal((prev) => ({
      ...prev,
      position: payload.position,
      rotation: payload.rotation,
    }));
  }, []);

  const handlePositionChange = useCallback(
    (axis: "x" | "y" | "z", value: number) => {
      setDecal((prev) => {
        const nextPosition: Vector3Tuple = [...prev.position] as Vector3Tuple;
        const limits = POSITION_LIMITS[axis];
        const clamped = clamp(value, limits.min, limits.max);
        const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;
        nextPosition[axisIndex] = Number(clamped.toFixed(4));
        return { ...prev, position: nextPosition };
      });
    },
    []
  );

  const handleRotationChange = useCallback(
    (axis: "x" | "y" | "z", value: number) => {
      setDecal((prev) => {
        const nextRotation: Vector3Tuple = [...prev.rotation] as Vector3Tuple;
        const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;
        nextRotation[axisIndex] = Math.round(value);
        return { ...prev, rotation: nextRotation };
      });
    },
    []
  );

  const handleScaleChange = useCallback((value: number) => {
    setDecal((prev) => ({ ...prev, scale: Number(value.toFixed(4)) }));
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validaciones
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Formato no válido", {
        description: "Solo PNG, JPG o WEBP.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Archivo muy grande", { description: "Máximo 5MB." });
      return;
    }

    setUploadStatus("Subiendo a la nube...");

    try {
      // 1. Subir a S3 y Registrar en Backend
      const savedImage = await imageService.uploadAndRegister(file);

      // 2. Calcular Aspect Ratio (usando la URL remota)
      const aspectRatio = await measureImageAspectRatio(savedImage.url);

      // 3. Actualizar el estado del Decal
      setDecal((prev) => ({
        ...prev,
        imageUrl: savedImage.url, // <-- Usamos la URL de S3
        aspectRatio: Number(aspectRatio.toFixed(4)) || 1,
      }));

      setUploadStatus(null);
      toast.success("Imagen cargada", { description: "Tu diseño está listo." });
    } catch (error) {
      console.error("Error en el flujo de imagen", error);
      setUploadStatus(null);
      toast.error("Error al subir imagen", {
        description: "Inténtalo de nuevo.",
      });
    }
  }, []);

  const handleReset = useCallback(() => {
    setDecal(createDefaultDecal());
    setBaseColor("#ffffff");
    setUploadStatus(null);
  }, []);

  const backendPayload = useMemo<CustomizationPayload>(
    () => ({
      baseModel: "/shirt.glb",
      baseColor,
      decal,
    }),
    [baseColor, decal]
  );

  const payloadPreview = useMemo(() => {
    if (!backendPayload.decal) {
      return JSON.stringify(backendPayload, null, 2);
    }
    const sanitized: CustomizationPayload = {
      ...backendPayload,
      decal: {
        ...backendPayload.decal,
        imageUrl: backendPayload.decal.imageUrl?.startsWith("data:")
          ? "[inline-data-uri]"
          : backendPayload.decal.imageUrl,
      },
    };
    return JSON.stringify(sanitized, null, 2);
  }, [backendPayload]);

  // --- NUEVO JSX (Adaptado a nuestra app) ---
  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 p-4">
      {/* Columna Izquierda: Canvas 3D */}
      <section className="flex-1 md:h-[85vh]">
        <ShirtCanvas
          decal={decal}
          baseColor={baseColor}
          onSurfacePick={handleSurfacePick}
        />
      </section>

      {/* Columna Derecha: Controles */}
      <section className="w-full md:w-[380px] md:h-[85vh] overflow-y-auto">
        <CustomizerControls
          decal={decal}
          baseColor={baseColor}
          payloadPreview={payloadPreview}
          uploadStatus={uploadStatus}
          onImageChange={handleImageUpload}
          onPositionChange={handlePositionChange}
          onRotationChange={handleRotationChange}
          onScaleChange={handleScaleChange}
          onBaseColorChange={setBaseColor}
          onReset={handleReset}
        />
      </section>
    </div>
  );
}
