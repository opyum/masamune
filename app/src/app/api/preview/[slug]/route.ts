import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Find site by slug
  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site || !site.codeStoragePath) {
    return new NextResponse(
      `<html><body><h1>Site non trouvé</h1><p>Le site "${slug}" n'existe pas ou n'a pas encore été généré.</p></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Parse stored files
  let files: Record<string, string>;
  try {
    files = JSON.parse(site.codeStoragePath);
  } catch {
    return new NextResponse("Erreur de lecture du site", { status: 500 });
  }

  // Determine which file to serve
  const url = new URL(request.url);
  const path = url.searchParams.get("page") || "index.html";
  const content = files[path] || files["index.html"];

  if (!content) {
    return new NextResponse("Page non trouvée", { status: 404 });
  }

  // Return the HTML
  const contentType = path.endsWith(".xml")
    ? "application/xml"
    : path.endsWith(".txt")
    ? "text/plain"
    : "text/html; charset=utf-8";

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "X-Masamune-Site": slug,
    },
  });
}
