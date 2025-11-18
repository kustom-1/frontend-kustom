// src/app/(main)/customize/page.tsx

"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, UploadCloud } from "lucide-react";

// Componentes
import { ShirtCanvas } from "@/components/features/customizer/ShirtCanvas";
import { CustomizerControls } from "@/components/features/customizer/CustomizerControls";
import { DesignSaveDialog } from "@/components/features/customizer/DesignSaveDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Servicios y Tipos
import { imageService } from "@/services/image.service";
import { clothService } from "@/services/cloth.service";
import { designService } from "@/services/design.service";
import type {
  DecalState,
  SurfacePickResult,
  CreateDesignDto,
  ImageType,
} from "@/lib/definitions";

// --- HELPERS DE LA POC ---
const createDefaultDecal = (imageUrl = "/logo.png"): DecalState => ({
  imageUrl,
  position: [0, 0.15, 0.08],
  rotation: [0, 0, 0],
  scale: 0.35,
  aspectRatio: 1,
});

async function measureImageAspectRatio(src: string) {
  return new Promise<number>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image.width / image.height || 1);
    image.onerror = reject;
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}
// -------------------------

export default function CustomizePage() {
  // --- 1. FETCH DATA ---
  const { data: cloths } = useQuery({
    queryKey: ["cloths"],
    queryFn: () => clothService.getAll(),
  });
  const { data: models } = useQuery({
    queryKey: ["images", "3d-model"],
    queryFn: () => imageService.getAll("3d-model"),
  });
  const { data: decals } = useQuery({
    queryKey: ["images", "decal"],
    queryFn: () => imageService.getAll("decal"),
  });

  // --- 2. ESTADOS ---
  const [selectedClothId, setSelectedClothId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<ImageType | null>(null);
  const [selectedDecalImage, setSelectedDecalImage] =
    useState<ImageType | null>(null);

  const [decal, setDecal] = useState<DecalState>(createDefaultDecal());
  const [baseColor, setBaseColor] = useState("#ffffff");

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  // --- 3. LOGICA DE IMAGEN ---
  const handleSelectDecalFromGallery = async (image: ImageType) => {
    setSelectedDecalImage(image);
    try {
      const ratio = await measureImageAspectRatio(image.url);
      setDecal((prev) => ({
        ...prev,
        imageUrl: image.url,
        aspectRatio: ratio,
      }));
    } catch (e) {
      setDecal((prev) => ({ ...prev, imageUrl: image.url }));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadStatus("Subiendo...");
    try {
      const savedImage = await imageService.uploadAndCreate(file, {
        tags: ["custom-upload", "decal"],
        isPublic: false,
      });

      setSelectedDecalImage(savedImage);
      const ratio = await measureImageAspectRatio(savedImage.url);
      setDecal((prev) => ({
        ...prev,
        imageUrl: savedImage.url,
        aspectRatio: ratio,
      }));
      setUploadStatus(null);
      toast.success("Imagen cargada");
    } catch (error) {
      console.error(error);
      setUploadStatus(null);
      toast.error("Error al subir");
    }
  };

  // --- 4. LOGICA DE POC ---
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
        const nextPos = [...prev.position] as [number, number, number];
        const idx = axis === "x" ? 0 : axis === "y" ? 1 : 2;
        nextPos[idx] = value;
        return { ...prev, position: nextPos };
      });
    },
    []
  );
  const handleRotationChange = useCallback(
    (axis: "x" | "y" | "z", value: number) => {
      setDecal((prev) => {
        const nextRot = [...prev.rotation] as [number, number, number];
        const idx = axis === "x" ? 0 : axis === "y" ? 1 : 2;
        nextRot[idx] = value;
        return { ...prev, rotation: nextRot };
      });
    },
    []
  );
  const handleScaleChange = useCallback(
    (val: number) => setDecal((p) => ({ ...p, scale: val })),
    []
  );

  // --- 5. LOGICA DE GUARDADO ---
  const saveMutation = useMutation({
    mutationFn: (designData: CreateDesignDto) =>
      designService.create(designData),
    onSuccess: () => {
      toast.success("¡Diseño guardado exitosamente!");
      setIsSaveDialogOpen(false);
    },
    onError: () => toast.error("Error al guardar el diseño."),
  });

  const handleSaveDesign = (meta: { name: string; description: string }) => {
    if (!selectedModel || !selectedDecalImage) {
      toast.error("Debes seleccionar un modelo base y una imagen.");
      return;
    }
    if (!selectedClothId) {
      toast.error("Debes seleccionar una prenda (Cloth).");
      return;
    }

    const payload: CreateDesignDto = {
      name: meta.name,
      description: meta.description,
      cloth: Number(selectedClothId),
      baseModel: selectedModel.id,
      decalImage: selectedDecalImage.id,
      baseColor: baseColor,
      isPublic: true,
      isActive: true,
      user: 0,
      decal: {
        position: decal.position,
        rotation: decal.rotation,
        scale: decal.scale,
        aspectRatio: decal.aspectRatio,
      },
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:flex-row bg-muted/10 overflow-hidden">
      {/* IZQUIERDA: Canvas 3D */}
      <section className="flex-1 relative bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden">
        {selectedModel ? (
          <ShirtCanvas
            modelUrl={selectedModel.url}
            decal={decal}
            baseColor={baseColor}
            onSurfacePick={handleSurfacePick}
          />
        ) : (
          <div className="text-muted-foreground">Cargando modelo 3D...</div>
        )}
      </section>

      {/* DERECHA: Panel de Control con Tabs */}
      <section className="w-full md:w-[400px] border-l bg-background flex flex-col overflow-hidden pb-3">
        {/* Header Fijo */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold">Personalizador</h2>
          <Button size="sm" onClick={() => setIsSaveDialogOpen(true)}>
            <Save className="w-4 h-4 mr-2" /> Guardar
          </Button>
        </div>

        {/* Tabs con Scroll Interno */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            defaultValue="config"
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* TabsList Fijo */}
            <div className="px-4 pt-4 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">Configuración</TabsTrigger>
                <TabsTrigger value="design">Diseño</TabsTrigger>
              </TabsList>
            </div>

            {/* Contenido con Scroll */}
            <div className="flex-1 overflow-y-auto">
              {/* TAB 1: Selección de Base */}
              <TabsContent value="config" className="m-0 p-4 space-y-6 h-full">
                <div className="space-y-2">
                  <Label>Prenda Base (Producto)</Label>
                  <Select
                    value={selectedClothId}
                    onValueChange={setSelectedClothId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una prenda..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cloths?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modelo 3D</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {models?.map((model) => (
                      <Card
                        key={model.id}
                        className={`cursor-pointer hover:border-primary transition-all ${
                          selectedModel?.id === model.id
                            ? "border-primary ring-2 ring-primary/20"
                            : ""
                        }`}
                        onClick={() => setSelectedModel(model)}
                      >
                        <CardContent className="p-2 flex items-center justify-center h-20 bg-muted/50">
                          <span className="text-[10px] text-muted-foreground break-all text-center">
                            {model.url.split("/").pop()}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: Edición */}
              <TabsContent value="design" className="m-0 p-4 space-y-6 h-full">
                {/* Galería de Decals */}
                <div className="space-y-2">
                  <Label>Imagen (Decal)</Label>
                  <div className="h-32 border rounded-md p-2 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {decals?.map((img) => (
                        <div
                          key={img.id}
                          className={`aspect-square rounded-md border cursor-pointer overflow-hidden relative ${
                            selectedDecalImage?.id === img.id
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                          onClick={() => handleSelectDecalFromGallery(img)}
                        >
                          <img
                            src={img.url}
                            alt="decal"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Controles existentes */}
                <CustomizerControls
                  decal={decal}
                  baseColor={baseColor}
                  payloadPreview={""}
                  uploadStatus={uploadStatus}
                  onImageChange={handleImageUpload}
                  onPositionChange={handlePositionChange}
                  onRotationChange={handleRotationChange}
                  onScaleChange={handleScaleChange}
                  onBaseColorChange={setBaseColor}
                  onReset={() =>
                    setDecal(
                      createDefaultDecal(selectedDecalImage?.url || "/logo.png")
                    )
                  }
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      <DesignSaveDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveDesign}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}
