import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      domains: { select: { domainName: true, status: true } },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Mes sites</h2>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Creer un site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun site pour le moment
          </h3>
          <p className="text-gray-600 mb-6">
            Creez votre premier site en quelques minutes grace a l&apos;IA.
          </p>
          <Link
            href="/dashboard/new"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Creer mon premier site
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/dashboard/sites/${site.id}`}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">{site.businessName}</h3>
              <p className="text-sm text-gray-500 mt-1">{site.businessType}</p>
              <div className="flex items-center gap-2 mt-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.status === "live"
                      ? "bg-green-100 text-green-800"
                      : site.status === "generating"
                      ? "bg-yellow-100 text-yellow-800"
                      : site.status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {site.status}
                </span>
                <span className="text-xs text-gray-400">
                  {site.slug}.masamune.app
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
