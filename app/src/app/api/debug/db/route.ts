import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/debug/db — test Prisma DB connection
export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    DATABASE_URL_set: !!process.env.DATABASE_URL,
    DIRECT_URL_set: !!process.env.DIRECT_URL,
  };

  try {
    const result = await prisma.$queryRaw<
      { now: Date }[]
    >`SELECT NOW() as now`;
    checks.connection = "ok";
    checks.serverTime = result[0]?.now;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    checks.connection = "error";
    checks.error = msg;
  }

  // Check if tables exist
  try {
    const tables = await prisma.$queryRaw<
      { table_name: string }[]
    >`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    checks.tables = tables.map((t) => t.table_name);
  } catch {
    checks.tables = "error";
  }

  // Check user count
  try {
    const count = await prisma.user.count();
    checks.userCount = count;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    checks.userCount = `error: ${msg}`;
  }

  const ok = checks.connection === "ok";
  return NextResponse.json(checks, { status: ok ? 200 : 500 });
}
