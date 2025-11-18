// src/app/(main)/dashboard/images/page.tsx

import { ImageClient } from "@/components/features/images/ImageClient";
import React from "react";

export default async function ImagesPage() {
  return (
    <div className="w-full">
      <ImageClient />
    </div>
  );
}
