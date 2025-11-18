// src/components/features/customizer/CustomizerControls.tsx

"use client";

import { ChangeEvent } from "react";
import type { DecalState } from "@/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

type Axis = "x" | "y" | "z";

type CustomizerControlsProps = {
  decal: DecalState;
  baseColor: string;
  payloadPreview: string;
  uploadStatus: string | null;
  onImageChange: (file: File) => void | Promise<void>;
  onPositionChange: (axis: Axis, value: number) => void;
  onRotationChange: (axis: Axis, value: number) => void;
  onScaleChange: (value: number) => void;
  onBaseColorChange: (color: string) => void;
  onReset: () => void;
};

const axisIndex: Record<Axis, number> = { x: 0, y: 1, z: 2 };

// Helper para los sliders
function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">
          {value.toFixed(3)}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
      />
    </div>
  );
}

export function CustomizerControls({
  decal,
  baseColor,
  payloadPreview,
  uploadStatus,
  onImageChange,
  onPositionChange,
  onRotationChange,
  onScaleChange,
  onBaseColorChange,
  onReset,
}: CustomizerControlsProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImageChange(file);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* --- Arte y Color --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Arte</CardTitle>
            <Button variant="ghost" size="sm" onClick={onReset} type="button">
              Reset
            </Button>
          </div>
          <CardDescription>
            Carga un PNG/JPG/WEBP. Transparente para mejores resultados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-center text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />
            <span>Subir imagen</span>
            {uploadStatus && (
              <span className="text-xs text-muted-foreground">
                {uploadStatus}
              </span>
            )}
          </Label>

          <Separator />

          <div className="space-y-2">
            <Label>Color base</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={baseColor}
                onChange={(event) => onBaseColorChange(event.target.value)}
                className="h-10 w-16 cursor-pointer p-1" // Shadcn Input[type=color]
              />
              <span className="font-mono text-sm text-muted-foreground">
                {baseColor}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Posición --- */}
      <Card>
        <CardHeader>
          <CardTitle>Posición</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ControlSlider
            label="Posición X"
            min={-0.35}
            max={0.35}
            step={0.005}
            value={decal.position[axisIndex.x]}
            onChange={(v) => onPositionChange("x", v)}
          />
          <ControlSlider
            label="Posición Y"
            min={0}
            max={0.45}
            step={0.005}
            value={decal.position[axisIndex.y]}
            onChange={(v) => onPositionChange("y", v)}
          />
          <ControlSlider
            label="Posición Z"
            min={-0.2}
            max={0.2}
            step={0.005}
            value={decal.position[axisIndex.z]}
            onChange={(v) => onPositionChange("z", v)}
          />
        </CardContent>
      </Card>

      {/* --- Rotación --- */}
      <Card>
        <CardHeader>
          <CardTitle>Rotación</CardTitle>
          <CardDescription>
            Valores en grados. Se suman al alineamiento automático.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ControlSlider
            label="Rotación X"
            min={-180}
            max={180}
            step={1}
            value={decal.rotation[axisIndex.x]}
            onChange={(v) => onRotationChange("x", v)}
          />
          <ControlSlider
            label="Rotación Y"
            min={-180}
            max={180}
            step={1}
            value={decal.rotation[axisIndex.y]}
            onChange={(v) => onRotationChange("y", v)}
          />
          <ControlSlider
            label="Rotación Z"
            min={-180}
            max={180}
            step={1}
            value={decal.rotation[axisIndex.z]}
            onChange={(v) => onRotationChange("z", v)}
          />
        </CardContent>
      </Card>

      {/* --- Escala --- */}
      <Card>
        <CardHeader>
          <CardTitle>Escala</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ControlSlider
            label="Uniforme"
            min={0.05}
            max={1.2}
            step={0.01}
            value={decal.scale}
            onChange={onScaleChange}
          />
          <p className="text-xs text-muted-foreground pt-2">
            Ratio de aspecto: {decal.aspectRatio.toFixed(2)}:1
          </p>
        </CardContent>
      </Card>

      {/* --- Payload --- */}
      {payloadPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Payload (Debug)</CardTitle>
            <CardDescription>
              Este JSON se enviará a la API de `/designs`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">
              {payloadPreview}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
