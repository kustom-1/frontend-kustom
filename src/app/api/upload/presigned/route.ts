// src/app/api/upload/presigned/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        await jwtVerify(token, SECRET_KEY); // Validar sesión

        const { filename, fileType } = await req.json();

        // Crear un nombre único: timestamp-filename_limpio
        const cleanName = filename.replace(/[^a-zA-Z0-9.]/g, "_");

        let assetType = "images";
        if (fileType == "model/gltf-binary") {
            assetType = "models"
        }

        const uniqueKey = `assets/${assetType}/${Date.now()}-${cleanName}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueKey,
            ContentType: fileType,
        });

        // Generar URL firmada (válida por 5 minutos)
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        // URL pública final del archivo (para guardar en BD)
        const fileUrl = `${process.env.AWS_STORAGE}/${uniqueKey}`;

        return NextResponse.json({ uploadUrl, fileUrl });

    } catch (error) {
        console.error("Error generando presigned URL:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}