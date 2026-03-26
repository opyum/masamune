import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const statusConfig: Record<string, { label: string; classes: string }> = {
  live: { label: "En ligne", classes: "bg-emerald-50 text-emerald-600" },
  generating: { label: "Génération", classes: "bg-amber-50 text-amber-600" },
  error: { label: "Erreur", classes: "bg-red-50 text-red-600" },
  drafting: { label: "Brouillon", classes: "bg-blue-50 text-blue-600" },
  partial: { label: "Partiel", classes: "bg-amber-50 text-amber-600" },
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  let sites: Awaited<ReturnType<typeof prisma.site.findMany>> = [];
  try {
    sites = await prisma.site.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        domains: { select: { domainName: true, status: true } },
      },
    });
  } catch {
    // DB not ready yet - show empty state
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Mes sites</h2>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Aucun site pour le moment
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Créez votre premier site en quelques minutes grâce à l&apos;IA.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Créer mon premier site
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => {
            const status = statusConfig[site.status] || statusConfig.drafting;
            return (
              <Link
                key={site.id}
                href={`/dashboard/sites/${site.id}`}
                className="group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-slate-300"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">
                      {site.businessName}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.classes}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {site.slug}.masamune.app
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
