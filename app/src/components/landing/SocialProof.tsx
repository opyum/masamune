export default function SocialProof() {
  const stats = [
    { value: "500+", label: "Sites créés" },
    { value: "98%", label: "Clients satisfaits" },
    { value: "5 min", label: "Temps de création" },
  ];

  return (
    <section className="py-16 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-indigo-600">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
