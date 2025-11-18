// src/app/(main)/dashboard/categories/page.tsx

import { CategoryClient } from "@/components/features/categories/CategoryClient";
import React from "react";

export default async function CategoriesPage() {
  return (
    <div className="w-full">
      <CategoryClient />
    </div>
  );
}
