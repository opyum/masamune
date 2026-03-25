import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  // Check user is Pro+
  if (user!.plan === "free") {
    return NextResponse.json(
      { error: "Upgrade to Pro to get a custom domain" },
      { status: 403 }
    );
  }

  const { query } = await request.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  // Sanitize domain name
  const baseName = query
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");

  const tlds = [".fr", ".com", ".shop", ".net", ".io"];
  const results = [];

  for (const tld of tlds) {
    results.push({
      domain: baseName + tld,
      available: true, // Placeholder — real OVH check done by worker
      price: tld === ".fr" ? 7.99 : tld === ".com" ? 9.99 : 12.99,
      currency: "EUR",
    });
  }

  return NextResponse.json(results);
}
