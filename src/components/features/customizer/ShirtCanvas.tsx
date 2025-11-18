// src/components/features/customizer/ShirtCanvas.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useTexture,
  Decal,
  Center,
  Bounds,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { DecalState, SurfacePickResult } from "@/lib/definitions";
import { Button } from "@/components/ui/button"; // <-- Importar Shadcn Button

const SHIRT_MESH_NAME = "T-Shirt";
const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0.45, 3.6];
const DEFAULT_ORBIT_TARGET: [number, number, number] = [0, 0.25, 0];
const DEFAULT_CAMERA_FOV = 28;

type ShirtGLTF = {
  nodes: Record<string, THREE.Mesh>;
};

type ShirtModelProps = {
  modelUrl: string;
  decal: DecalState | null;
  baseColor: string;
  onSurfacePick?: (result: SurfacePickResult) => void;
};

// Hook useEnhancedTexture (copiado idéntico)
function useEnhancedTexture(mapUrl: string | null) {
  const { gl } = useThree();
  const sourceTexture = useTexture(mapUrl ?? "/logo.png"); // <-- Ruta actualizada

  const enhancedTexture = useMemo(() => {
    if (!sourceTexture) return sourceTexture;
    const cloned = sourceTexture.clone();
    cloned.colorSpace = THREE.SRGBColorSpace;
    cloned.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
    cloned.minFilter = THREE.LinearMipmapLinearFilter;
    cloned.magFilter = THREE.LinearFilter;
    cloned.wrapS = THREE.ClampToEdgeWrapping;
    cloned.wrapT = THREE.ClampToEdgeWrapping;
    cloned.generateMipmaps = true;
    cloned.needsUpdate = true;
    return cloned;
  }, [sourceTexture, gl]);

  useEffect(() => {
    return () => {
      if (enhancedTexture && enhancedTexture !== sourceTexture) {
        enhancedTexture.dispose();
      }
    };
  }, [enhancedTexture, sourceTexture]);

  return enhancedTexture;
}

// Componente ShirtModel (lógica idéntica)
function ShirtModel({
  modelUrl,
  decal,
  baseColor,
  onSurfacePick,
}: ShirtModelProps) {
  const { nodes } = useGLTF(modelUrl) as any;
  const decalTexture = useEnhancedTexture(decal?.imageUrl ?? "/logo.png"); // <-- Ruta actualizada

  const geometry =
    (nodes[SHIRT_MESH_NAME] as THREE.Mesh)?.geometry ||
    (
      Object.values(nodes).find(
        (n: any) => n.isMesh && n.geometry
      ) as THREE.Mesh
    )?.geometry;
  const shirtSize = useMemo(() => {
    if (!geometry) return null;
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }
    const size = new THREE.Vector3();
    geometry.boundingBox?.getSize(size);
    return size;
  }, [geometry]);

  const decalPosition = useMemo(() => {
    if (!decal) return null;
    return new THREE.Vector3(...decal.position);
  }, [decal]);

  const decalRotation = useMemo(() => {
    if (!decal) return null;
    return new THREE.Euler(
      THREE.MathUtils.degToRad(decal.rotation[0]),
      THREE.MathUtils.degToRad(decal.rotation[1]),
      THREE.MathUtils.degToRad(decal.rotation[2])
    );
  }, [decal]);

  const decalScale = useMemo(() => {
    if (!decal) return null;
    const shirtWidth = shirtSize?.x ?? 1;
    const normalizedScale = Math.max(decal.scale, 0);
    const width = normalizedScale * shirtWidth;
    const height = decal.aspectRatio === 0 ? width : width / decal.aspectRatio;
    const depth = Math.max(width * 0.05, 0.005);
    return new THREE.Vector3(width, height, depth);
  }, [decal, shirtSize]);

  const handleSurfaceClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!onSurfacePick) return;
      event.stopPropagation();

      const mesh = event.object as THREE.Mesh;
      const localPoint = mesh.worldToLocal(event.point.clone());
      const position: SurfacePickResult["position"] = [
        localPoint.x,
        localPoint.y,
        localPoint.z,
      ];

      if (!event.face?.normal) {
        onSurfacePick({ position, rotation: decal?.rotation ?? [0, 0, 0] });
        return;
      }

      const localNormal = event.face.normal.clone().normalize();
      const rotationQuaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        localNormal
      );

      const rotationEuler = new THREE.Euler().setFromQuaternion(
        rotationQuaternion,
        "XYZ"
      );
      const rotation: SurfacePickResult["rotation"] = [
        THREE.MathUtils.radToDeg(rotationEuler.x),
        THREE.MathUtils.radToDeg(rotationEuler.y),
        THREE.MathUtils.radToDeg(rotationEuler.z),
      ];

      onSurfacePick({ position, rotation });
    },
    [decal?.rotation, onSurfacePick]
  );

  if (!geometry) {
    console.error(`Mesh '${SHIRT_MESH_NAME}' was not found in shirt.glb.`);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      onPointerDown={handleSurfaceClick}
    >
      <meshStandardMaterial
        color={baseColor}
        roughness={0.65}
        metalness={0.05}
      />
      {decal &&
        decalPosition &&
        decalRotation &&
        decalScale &&
        decalTexture && (
          <Decal
            position={decalPosition}
            rotation={decalRotation}
            scale={decalScale}
          >
            <meshStandardMaterial
              map={decalTexture}
              transparent
              depthTest={false}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
              toneMapped={false}
            />
          </Decal>
        )}
    </mesh>
  );
}

type ShirtCanvasProps = {
  modelUrl: string;
  decal: DecalState | null;
  baseColor: string;
  onSurfacePick?: (result: SurfacePickResult) => void;
};

export function ShirtCanvas({
  modelUrl,
  decal,
  baseColor,
  onSurfacePick,
}: ShirtCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handleResetView = useCallback(() => {
    controlsRef.current?.reset();
  }, []);

  return (
    // Aplicamos estilos de Card de Shadcn
    <div className="relative w-full h-full rounded-lg border bg-card shadow-sm">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: DEFAULT_CAMERA_FOV }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        className="rounded-lg" // Asegurar que el canvas herede el radius
      >
        <color attach="background" args={[0x0f0f0f]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 4]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 4, 2]} intensity={0.4} />
        <Environment preset="city" background={false} />
        <Bounds fit clip observe margin={1.15}>
          <Center top>
            <ShirtModel
              modelUrl={modelUrl}
              decal={decal}
              baseColor={baseColor}
              onSurfacePick={onSurfacePick}
            />
          </Center>
        </Bounds>
        <OrbitControls
          makeDefault
          minDistance={0.9}
          maxDistance={6}
          enablePan
          target={DEFAULT_ORBIT_TARGET}
          ref={controlsRef}
        />
      </Canvas>
      <div className="absolute right-3 top-3 flex gap-2">
        {/* --- CAMBIO A SHADCN --- */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetView}
        >
          Reencuadrar vista
        </Button>
      </div>
    </div>
  );
}

// useGLTF.preload("/shirt.glb"); // <-- Ruta actualizada
