const rows = [
  {
    label: "Prix",
    agency: "2 000 EUR+",
    cms: "30 EUR+/mois",
    ai: "20 EUR+/mois",
    masamune: "0 EUR",
  },
  {
    label: "Delai de creation",
    agency: "4 semaines",
    cms: "2 semaines",
    ai: "1 heure",
    masamune: "5 minutes",
  },
  {
    label: "SEO optimise",
    agency: true,
    cms: false,
    ai: false,
    masamune: true,
  },
  {
    label: "Domaine inclus",
    agency: false,
    cms: false,
    ai: false,
    masamune: true,
  },
  {
    label: "Maintenance",
    agency: "Manuelle",
    cms: "A votre charge",
    ai: "A votre charge",
    masamune: "Automatique",
  },
  {
    label: "Mobile natif",
    agency: "En option",
    cms: "Selon template",
    ai: "Variable",
    masamune: true,
  },
  {
    label: "Competences requises",
    agency: false,
    cms: true,
    ai: true,
    masamune: false,
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <svg className="h-5 w-5 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="h-5 w-5 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return <span>{value}</span>;
}

export default function Comparison() {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-slate-800">
            Pourquoi Masamune ?
          </h2>
          <p className="mt-3 text-lg text-slate-500">
            Comparez avec les alternatives traditionnelles
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-left font-medium text-slate-500" />
                <th className="px-6 py-4 text-center font-medium text-slate-500">
                  Agence web
                </th>
                <th className="px-6 py-4 text-center font-medium text-slate-500">
                  CMS (Wix, WP)
                </th>
                <th className="px-6 py-4 text-center font-medium text-slate-500">
                  IA (Lovable, Bolt)
                </th>
                <th className="px-6 py-4 text-center font-semibold text-indigo-600 bg-indigo-50/50">
                  Masamune
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                >
                  <td className="px-6 py-3.5 font-medium text-slate-700">
                    {row.label}
                  </td>
                  <td className="px-6 py-3.5 text-center text-slate-500">
                    <CellValue value={row.agency} />
                  </td>
                  <td className="px-6 py-3.5 text-center text-slate-500">
                    <CellValue value={row.cms} />
                  </td>
                  <td className="px-6 py-3.5 text-center text-slate-500">
                    <CellValue value={row.ai} />
                  </td>
                  <td className="px-6 py-3.5 text-center font-medium text-slate-800 bg-indigo-50/30">
                    <CellValue value={row.masamune} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-medium text-slate-700 mb-3">
                {row.label}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">Agence</div>
                <div className="text-slate-600">
                  <CellValue value={row.agency} />
                </div>
                <div className="text-slate-400">CMS</div>
                <div className="text-slate-600">
                  <CellValue value={row.cms} />
                </div>
                <div className="text-slate-400">IA</div>
                <div className="text-slate-600">
                  <CellValue value={row.ai} />
                </div>
                <div className="font-medium text-indigo-600">Masamune</div>
                <div className="font-medium text-slate-800">
                  <CellValue value={row.masamune} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
