import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const domainStatusConfig: Record<string, { label: string; classes: string }> = {
  searching: { label: "Recherche", classes: "bg-blue-50 text-blue-600" },
  purchased: { label: "Acheté", classes: "bg-amber-50 text-amber-600" },
  dns_configured: { label: "DNS OK", classes: "bg-emerald-50 text-emerald-600" },
  ssl_active: { label: "SSL actif", classes: "bg-emerald-50 text-emerald-600" },
  error: { label: "Erreur", classes: "bg-red-50 text-red-600" },
};

export default async function DomainsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let domains: (Awaited<ReturnType<typeof prisma.domain.findMany>>[number] & { site?: { businessName: string; slug: string } })[] = [];
  try {
    domains = await prisma.domain.findMany({
      where: { userId: user.id },
      include: {
        site: { select: { businessName: true, slug: true } },
      },
      orderBy: { domainName: "asc" },
    }) as typeof domains;
  } catch {
    // DB not ready - show empty state
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    });
  } catch {
    // DB not ready - show empty state
  }

  const isFree = dbUser?.plan === "free";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Domaines</h2>
      </div>

      {isFree && (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-6">
          <h3 className="text-sm font-semibold text-indigo-800">
            Domaine personnalisé
          </h3>
          <p className="mt-1 text-sm text-indigo-600">
            Passez au plan Pro pour acheter et configurer un domaine personnalisé.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Voir les plans
          </Link>
        </div>
      )}

      {domains.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Aucun domaine
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Vos domaines personnalisés apparaîtront ici une fois configurés.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => {
            const status =
              domainStatusConfig[domain.status] || domainStatusConfig.searching;
            return (
              <div
                key={domain.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      {domain.domainName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Lié à : {domain.site?.businessName} ({domain.site?.slug}
                      .masamune.app)
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.classes}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                  <span>Registrar : {domain.registrar}</span>
                  {domain.expiresAt && (
                    <span>
                      Expire :{" "}
                      {new Date(domain.expiresAt).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
