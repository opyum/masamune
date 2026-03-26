import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SiteAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let site = null;
  try {
    site = await prisma.site.findFirst({
      where: { id, userId: user.id },
    });
  } catch {
    // DB not ready - redirect to dashboard
    redirect("/dashboard");
  }

  if (!site) redirect("/dashboard");

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    });
  } catch {
    // DB not ready - show fallback
  }

  const hasPlan = dbUser?.plan === "business" || dbUser?.plan === "enterprise";

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/dashboard/sites/${id}`}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Retour
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">
          Analytics &mdash; {site.businessName}
        </h2>
      </div>

      {!hasPlan ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-8 text-center">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">
            Disponible avec le plan Business
          </h3>
          <p className="text-sm text-indigo-600 mb-4">
            Accédez aux statistiques de visites, sources de trafic et pages
            populaires de votre site.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Voir les plans
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Visiteurs", value: "--", sub: "Ce mois" },
              { label: "Pages vues", value: "--", sub: "Ce mois" },
              { label: "Durée moy.", value: "--", sub: "min:sec" },
              { label: "Taux de rebond", value: "--", sub: "%" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <p className="text-xs font-medium text-slate-500">
                  {kpi.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {kpi.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Visites par jour
            </h3>
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-400">
                Le graphique sera affiché une fois les données Umami connectées.
              </p>
            </div>
          </div>

          {/* Sources & pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Sources de trafic
              </h3>
              <div className="h-32 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400">Bientôt disponible</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Pages populaires
              </h3>
              <div className="h-32 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400">Bientôt disponible</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
