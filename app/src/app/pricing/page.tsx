import PricingTable from "@/components/pricing/PricingTable";

export const metadata = {
  title: "Tarifs - Masamune",
  description: "Choisissez le plan qui correspond a vos besoins",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tarifs simples et transparents
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lancez votre site en quelques minutes. Pas de frais caches, pas
            d&apos;engagement.
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  );
}
