"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: "Nouveau site",
          businessType: "a-definir",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors de la creation");
        return;
      }

      const site = await response.json();
      router.push(`/dashboard/sites/${site.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  // Auto-create on mount
  useState(() => {
    handleCreate();
  });

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">
          {loading ? "Preparation de votre site..." : "Redirection..."}
        </p>
      </div>
    </div>
  );
}
