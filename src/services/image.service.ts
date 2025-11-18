// src/services/image.service.ts

import { bffApi } from "@/lib/api";
import axios from "axios";
import type { ImageType, CreateImageDto } from "@/lib/definitions";
// Nota: Asegúrate de tener el tipo 'Image' exportado en definitions.ts como 'ImageType' 
// o similar para no chocar con la clase nativa 'Image'.

export const imageService = {

    /**
   * Obtener imágenes, opcionalmente filtradas por tag.
   */
    getAll: async (tag?: string): Promise<ImageType[]> => {
        // Si hay tag, lo añadimos a la query string
        const url = tag ? `/images?tag=${encodeURIComponent(tag)}` : "/images";
        const { data } = await bffApi.get<ImageType[]>(url);
        return data;
    },

    /**
     * Eliminar imagen
     */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/images/${id}`);
    },

    /**
     * Método GENÉRICO para subir a S3 y registrar en backend.
     * Ahora acepta 'metadata' opcional para tags y visibilidad.
     */
    uploadAndCreate: async (
        file: File,
        metadata?: Partial<Omit<CreateImageDto, 'url' | 'user'>>
    ): Promise<ImageType> => {
        console.log("1. [ImageService] Solicitando URL presignada...");

        // 1. Obtener URL firmada (BFF -> AWS)
        const { data: presigned } = await bffApi.post<{ uploadUrl: string; fileUrl: string }>(
            "/upload/presigned",
            { filename: file.name, fileType: file.type }
        );

        console.log("2. [ImageService] Subiendo a S3...");

        // 2. Subir a S3 directamente
        try {
            await axios.put(presigned.uploadUrl, file, {
                headers: { "Content-Type": file.type },
            });
        } catch (s3Error: any) {
            console.error("Error S3:", s3Error);
            throw new Error("Fallo la subida a S3");
        }

        console.log("3. [ImageService] Registrando en BD...");

        // 3. Registrar en el backend con los metadatos proporcionados
        const payload = {
            url: presigned.fileUrl,
            tags: metadata?.tags || ["upload"], // Tags por defecto si no vienen
            isPublic: metadata?.isPublic ?? false, // False por defecto
        };

        const { data: savedImage } = await bffApi.post<ImageType>("/images", payload);
        return savedImage;
    },
};