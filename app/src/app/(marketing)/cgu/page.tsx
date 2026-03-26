export const metadata = {
  title: "Conditions Générales d'Utilisation - Masamune",
};

export default function CGUPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-sm text-slate-400 mb-8">
        Dernière mise à jour : 25 mars 2026
      </p>
      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            1. Objet
          </h2>
          <p>
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent
            l&apos;utilisation du service Masamune, plateforme de création de sites
            web assistée par intelligence artificielle, accessible à l&apos;adresse
            masamune.fr.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            2. Inscription et compte
          </h2>
          <p>
            L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de
            son inscription. Il est responsable de la confidentialité de ses
            identifiants de connexion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            3. Description du service
          </h2>
          <p>
            Masamune permet la création, l&apos;hébergement et la gestion de sites
            web professionnels via une interface conversationnelle. Le service
            inclut, selon le plan souscrit : génération de site par IA,
            hébergement, nom de domaine, certificat SSL et optimisation SEO.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            4. Tarifs et paiement
          </h2>
          <p>
            Les tarifs sont indiqués en euros TTC. Le paiement s&apos;effectue par
            carte bancaire via Stripe. Les abonnements sont renouvelables
            automatiquement sauf résiliation avant la date d&apos;échéance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            5. Droit de rétractation
          </h2>
          <p>
            Conformément à la législation en vigueur, l&apos;utilisateur dispose
            d&apos;un délai de 14 jours à compter de la souscription pour exercer
            son droit de rétractation, sauf si le service a été pleinement
            exécuté avant la fin de ce délai avec l&apos;accord express de
            l&apos;utilisateur.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            6. Responsabilité
          </h2>
          <p>
            Masamune s&apos;engage à fournir un service de qualité mais ne peut
            garantir un fonctionnement ininterrompu. L&apos;utilisateur est
            responsable du contenu qu&apos;il publie sur son site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            7. Résiliation
          </h2>
          <p>
            L&apos;utilisateur peut résilier son abonnement à tout moment depuis
            son espace client. Le site reste accessible jusqu&apos;à la fin de la
            période payée. Les données peuvent être exportées avant la
            suppression définitive.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            8. Droit applicable
          </h2>
          <p>
            Les présentes CGU sont soumises au droit français. En cas de litige,
            les tribunaux compétents seront ceux du siège social de Masamune SAS.
          </p>
        </section>
      </div>
    </div>
  );
}
