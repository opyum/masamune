export const metadata = {
  title: "Conditions Generales d'Utilisation - Masamune",
};

export default function CGUPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Conditions Generales d&apos;Utilisation
      </h1>
      <p className="text-sm text-slate-400 mb-8">
        Derniere mise a jour : 25 mars 2026
      </p>
      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            1. Objet
          </h2>
          <p>
            Les presentes Conditions Generales d&apos;Utilisation (CGU) regissent
            l&apos;utilisation du service Masamune, plateforme de creation de sites
            web assistee par intelligence artificielle, accessible a l&apos;adresse
            masamune.fr.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            2. Inscription et compte
          </h2>
          <p>
            L&apos;utilisateur s&apos;engage a fournir des informations exactes lors de
            son inscription. Il est responsable de la confidentialite de ses
            identifiants de connexion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            3. Description du service
          </h2>
          <p>
            Masamune permet la creation, l&apos;hebergement et la gestion de sites
            web professionnels via une interface conversationnelle. Le service
            inclut, selon le plan souscrit : generation de site par IA,
            hebergement, nom de domaine, certificat SSL et optimisation SEO.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            4. Tarifs et paiement
          </h2>
          <p>
            Les tarifs sont indiques en euros TTC. Le paiement s&apos;effectue par
            carte bancaire via Stripe. Les abonnements sont renouvelables
            automatiquement sauf resiliation avant la date d&apos;echeance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            5. Droit de retractation
          </h2>
          <p>
            Conformement a la legislation en vigueur, l&apos;utilisateur dispose
            d&apos;un delai de 14 jours a compter de la souscription pour exercer
            son droit de retractation, sauf si le service a ete pleinement
            execute avant la fin de ce delai avec l&apos;accord express de
            l&apos;utilisateur.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            6. Responsabilite
          </h2>
          <p>
            Masamune s&apos;engage a fournir un service de qualite mais ne peut
            garantir un fonctionnement ininterrompu. L&apos;utilisateur est
            responsable du contenu qu&apos;il publie sur son site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            7. Resiliation
          </h2>
          <p>
            L&apos;utilisateur peut resilier son abonnement a tout moment depuis
            son espace client. Le site reste accessible jusqu&apos;a la fin de la
            periode payee. Les donnees peuvent etre exportees avant la
            suppression definitive.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            8. Droit applicable
          </h2>
          <p>
            Les presentes CGU sont soumises au droit francais. En cas de litige,
            les tribunaux competents seront ceux du siege social de Masamune SAS.
          </p>
        </section>
      </div>
    </div>
  );
}
