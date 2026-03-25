import Link from "next/link";

const footerLinks = {
  Produit: [
    { label: "Fonctionnalites", href: "#comment-ca-marche" },
    { label: "Tarifs", href: "/pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Legal: [
    { label: "Mentions legales", href: "/mentions-legales" },
    { label: "CGU", href: "/cgu" },
    { label: "Confidentialite", href: "/confidentialite" },
  ],
  Contact: [
    { label: "contact@masamune.fr", href: "mailto:contact@masamune.fr" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="text-lg font-bold text-white">Masamune</span>
            <p className="mt-2 text-sm text-slate-400">
              Votre site professionnel en 5 minutes.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-500 text-center">
            &copy; 2026 Masamune. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
