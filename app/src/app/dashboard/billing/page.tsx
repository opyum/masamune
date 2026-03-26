import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanKey } from "@/lib/stripe-products";
import PricingTable from "@/components/pricing/PricingTable";
import PortalButton from "./PortalButton";

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        subscriptions: {
          where: { status: "active" },
          orderBy: { currentPeriodEnd: "desc" },
          take: 1,
        },
        _count: { select: { sites: true } },
      },
    });
  } catch {
    // DB not ready - show fallback
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Impossible de charger les informations de facturation. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  const currentPlan = user.plan as PlanKey;
  const planConfig = PLANS[currentPlan];
  const subscription = user.subscriptions[0];
  const sitesUsed = user._count.sites;
  const sitesLimit = planConfig.limits.sites;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Plan actuel</p>
            <p className="text-2xl font-bold text-gray-900">
              {planConfig.name}
            </p>
            {subscription && (
              <p className="text-sm text-gray-500 mt-1">
                Renouvellement le{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
            )}
          </div>
          {user.stripeCustomerId && <PortalButton />}
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Utilisation
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Sites</span>
              <span className="text-gray-900 font-medium">
                {sitesUsed} / {sitesLimit}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((sitesUsed / sitesLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade section */}
      {currentPlan !== "enterprise" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Changer de plan
          </h2>
          <PricingTable currentPlan={currentPlan} />
        </div>
      )}
    </div>
  );
}
