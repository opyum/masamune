import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import HowItWorks from "@/components/landing/HowItWorks";
import Examples from "@/components/landing/Examples";
import Comparison from "@/components/landing/Comparison";
import PricingTable from "@/components/pricing/PricingTable";
import FAQ from "@/components/landing/FAQ";

export const metadata = {
  title: "Masamune - Decrivez votre activite. Votre site est en ligne.",
  description:
    "Creez un site professionnel en 5 minutes grace a l'IA. Sans competence technique, optimise pour Google, domaine inclus.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Examples />
      <Comparison />
      <section id="tarifs" className="py-20 sm:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-800">
              Tarifs simples et transparents
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Pas de frais caches, pas d&apos;engagement.
            </p>
          </div>
          <PricingTable />
        </div>
      </section>
      <FAQ />
    </>
  );
}
