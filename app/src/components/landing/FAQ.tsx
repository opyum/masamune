"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Ai-je besoin de competences techniques ?",
    answer:
      "Non, aucune. Vous repondez a quelques questions en francais sur votre activite, et Masamune s'occupe de tout : design, code, mise en ligne, SEO.",
  },
  {
    question: "Combien de temps faut-il pour creer un site ?",
    answer:
      "Environ 5 minutes. Vous repondez aux questions de l'IA, et votre site est genere et mis en ligne automatiquement.",
  },
  {
    question: "Puis-je modifier mon site apres sa creation ?",
    answer:
      "Oui, a tout moment. Envoyez simplement un message dans le chat : \"Change le numero de telephone\", \"Ajoute une photo\". L'IA applique les modifications en quelques secondes.",
  },
  {
    question: "Comment fonctionne le domaine personnalise ?",
    answer:
      "Avec les plans Pro et superieur, vous pouvez rechercher et acheter un domaine (ex: mon-entreprise.fr) directement depuis Masamune. Nous gerons automatiquement le DNS et le certificat SSL.",
  },
  {
    question: "Mon site sera-t-il bien reference sur Google ?",
    answer:
      "Oui. Nos sites sont generes en HTML statique, ultra-rapides (score PageSpeed 95+), avec le balisage SEO (meta tags, Schema.org, sitemap) configure automatiquement.",
  },
  {
    question: "Que se passe-t-il si je resilie mon abonnement ?",
    answer:
      "Votre site reste en ligne jusqu'a la fin de la periode payee. Vous pouvez exporter votre code source a tout moment. Aucun lock-in.",
  },
  {
    question: "Le plan gratuit est-il vraiment gratuit ?",
    answer:
      "Oui, totalement. Un site sur un sous-domaine masamune.app, 5 modifications par mois, SEO basique. Pas de carte bancaire requise.",
  },
  {
    question: "Quels types d'activite sont compatibles ?",
    answer:
      "Masamune est ideal pour les sites vitrine : restaurants, artisans, professions liberales, commerces, associations, freelances. Pour l'e-commerce ou les applications complexes, d'autres solutions seront plus adaptees.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-slate-800">
            Questions frequentes
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {faq.question}
                  </span>
                  <svg
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
