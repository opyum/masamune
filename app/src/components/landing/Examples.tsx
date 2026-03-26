const examples = [
  {
    name: "Boulangerie du Vieux Lyon",
    sector: "Restaurant",
    gradient: "from-amber-50 to-orange-50",
    accent: "bg-amber-300/50",
  },
  {
    name: "Plomberie Martin",
    sector: "Artisan",
    gradient: "from-blue-50 to-cyan-50",
    accent: "bg-blue-300/50",
  },
  {
    name: "Salon Élégance",
    sector: "Beauté",
    gradient: "from-pink-50 to-rose-50",
    accent: "bg-pink-300/50",
  },
  {
    name: "Cabinet Dupont Avocats",
    sector: "Profession libérale",
    gradient: "from-slate-50 to-gray-100",
    accent: "bg-slate-300/50",
  },
  {
    name: "Yoga Harmony",
    sector: "Sport & Bien-être",
    gradient: "from-emerald-50 to-teal-50",
    accent: "bg-emerald-300/50",
  },
  {
    name: "Auto École Conduite+",
    sector: "Education",
    gradient: "from-violet-50 to-purple-50",
    accent: "bg-violet-300/50",
  },
];

export default function Examples() {
  return (
    <section className="py-20 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-slate-800">
            Des sites qui impressionnent
          </h2>
          <p className="mt-3 text-lg text-slate-500">
            Découvrez ce que Masamune peut créer pour votre secteur
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example) => (
            <div
              key={example.name}
              className="group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={`aspect-video bg-gradient-to-br ${example.gradient} p-6 flex flex-col justify-end`}
              >
                <div className={`h-2 w-16 ${example.accent} rounded mb-2`} />
                <div className="h-3 w-32 bg-slate-800/10 rounded mb-1" />
                <div className="h-2 w-full bg-slate-200/50 rounded mb-1" />
                <div className="h-2 w-2/3 bg-slate-200/50 rounded" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-800 truncate">
                  {example.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {example.sector}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
