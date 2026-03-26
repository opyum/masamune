import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl leading-tight">
            Décrivez votre activité.{" "}
            <span className="text-indigo-600">Votre site est en ligne.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 sm:text-xl max-w-2xl mx-auto">
            Créez un site professionnel en 5 minutes grâce à l&apos;IA. Sans
            aucune compétence technique. Optimisé pour Google dès le départ.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Créer mon site gratuitement
            </Link>
            <p className="text-sm text-slate-400">
              Gratuit, sans carte bancaire
            </p>
          </div>
        </div>

        {/* Demo mockup */}
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-slate-400">masamune.fr</span>
              </div>
            </div>
            <div className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Chat side */}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">M</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
                      Quel type d&apos;activité avez-vous ?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white">
                      Boulangerie artisanale à Lyon
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">M</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
                      Votre site est prêt ! 🎉
                    </div>
                  </div>
                </div>
                {/* Preview side */}
                <div className="flex-1">
                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 h-full flex flex-col justify-center">
                    <div className="h-3 w-24 bg-amber-300/50 rounded mb-3" />
                    <div className="h-6 w-40 bg-slate-800/10 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-200/50 rounded mb-1" />
                    <div className="h-3 w-3/4 bg-slate-200/50 rounded mb-4" />
                    <div className="h-8 w-28 bg-indigo-600/20 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
