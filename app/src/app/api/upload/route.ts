import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const siteId = formData.get("siteId") as string;

  if (!file || !siteId) {
    return NextResponse.json(
      { error: "file and siteId are required" },
      { status: 400 }
    );
  }

  // Verify site ownership
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "video/mp4"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non supporte. Utilisez JPG, PNG, WebP, SVG ou MP4." },
      { status: 400 }
    );
  }

  // Validate file size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 50MB)" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const fileName = `${siteId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from("site-assets")
    .getPublicUrl(data.path);

  // Save asset in DB
  const assetType = file.type.startsWith("video/") ? "video" : "image";
  const asset = await prisma.siteAsset.create({
    data: {
      siteId,
      type: assetType,
      originalUrl: urlData.publicUrl,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
