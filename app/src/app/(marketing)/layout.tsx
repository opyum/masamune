import Link from "next/link";
import Footer from "@/components/landing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-slate-100 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-slate-800">
              Masamune
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#comment-ca-marche"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Fonctionnalités
              </a>
              <a
                href="#tarifs"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Tarifs
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
              >
                Créer mon site
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
