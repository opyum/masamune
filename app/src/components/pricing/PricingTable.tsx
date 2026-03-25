"use client";

import { useState } from "react";
import { PLANS, PlanKey } from "@/lib/stripe-products";

interface PricingTableProps {
  currentPlan?: PlanKey;
}

export default function PricingTable({ currentPlan }: PricingTableProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  async function handleCheckout(plan: PlanKey) {
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  const planEntries = Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][];

  return (
    <div>
      {/* Interval toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === "yearly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Annuel <span className="text-green-600 text-xs">-25%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {planEntries.map(([key, plan]) => {
          const isCurrent = currentPlan === key;
          const isFree = key === "free";
          const price =
            interval === "yearly" && "priceYearly" in plan
              ? (plan as { priceYearly: number }).priceYearly
              : plan.price;

          return (
            <div
              key={key}
              className={`rounded-xl border p-6 flex flex-col ${
                key === "pro"
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "border-gray-200"
              }`}
            >
              {key === "pro" && (
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  Populaire
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {plan.name}
              </h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {price}&#8364;
                </span>
                {!isFree && (
                  <span className="text-gray-500 text-sm">/mois</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium"
                >
                  Plan actuel
                </button>
              ) : isFree ? (
                <div className="h-10" />
              ) : (
                <button
                  onClick={() => handleCheckout(key)}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    key === "pro"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Choisir {plan.name}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
