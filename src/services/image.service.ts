// src/services/image.service.ts

import { bffApi } from "@/lib/api";
import axios from "axios";

type UploadResponse = {
    id: number;
    url: string;
};

export const imageService = {
    uploadAndRegister: async (file: File): Promise<UploadResponse> => {
        console.log("1. Solicitando URL presignada...");

        // 1. Obtener URL firmada
        const { data: presigned } = await bffApi.post<{ uploadUrl: string; fileUrl: string }>(
            "/upload/presigned",
            { filename: file.name, fileType: file.type }
        );

        console.log("2. URL recibida. Iniciando subida a S3...", presigned.uploadUrl);

        // 2. Subir a S3 directamente
        try {
            await axios.put(presigned.uploadUrl, file, {
                headers: {
                    "Content-Type": file.type
                    // IMPORTANTE: No enviar Authorization header aquí, S3 lo rechazaría
                },
            });
        } catch (s3Error: any) {
            console.error("Error SUBIENDO a S3:", s3Error);
            // Ver si es un error de CORS o 403
            if (s3Error.code === "ERR_NETWORK") {
                throw new Error("Error de red al contactar S3");
            }
            throw new Error(`S3 rechazó la subida: ${s3Error.message}`);
        }

        console.log("3. Subida a S3 exitosa. Registrando en backend...");

        // 3. Registrar en el backend
        try {
            const { data: savedImage } = await bffApi.post<UploadResponse>("/images", {
                url: presigned.fileUrl,
            });
            console.log("4. Imagen registrada:", savedImage);
            return savedImage;
        } catch (backendError: any) {
            console.error("Error REGISTRANDO en backend:", backendError);
            throw backendError;
        }
    },
};