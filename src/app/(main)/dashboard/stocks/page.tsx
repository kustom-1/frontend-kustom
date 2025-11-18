// src/app/(main)/dashboard/stocks/page.tsx

import { StockClient } from "@/components/features/stocks/StockClient";
import React from "react";

export default async function StocksPage() {
  return (
    <div className="w-full">
      {/* Reemplazamos el placeholder con el componente real */}
      <StockClient />
    </div>
  );
}
