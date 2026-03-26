export const metadata = {
  title: "Politique de Confidentialité - Masamune",
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Politique de Confidentialité
      </h1>
      <p className="text-sm text-slate-400 mb-8">
        Dernière mise à jour : 25 mars 2026
      </p>
      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            1. Données collectées
          </h2>
          <p>
            Nous collectons les données suivantes lors de votre utilisation du
            service Masamune :
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Adresse e-mail (inscription et connexion)</li>
            <li>
              Informations de votre activité (fournies lors de la création du
              site)
            </li>
            <li>Données de paiement (traitées par Stripe, non stockées chez nous)</li>
            <li>Données de navigation (via Umami Analytics, sans cookies)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            2. Finalités du traitement
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fourniture du service de création et d&apos;hébergement de sites</li>
            <li>Gestion de votre compte et de votre abonnement</li>
            <li>Amélioration du service et statistiques d&apos;utilisation</li>
            <li>Communication relative au service (notifications, mises à jour)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            3. Base légale
          </h2>
          <p>
            Le traitement de vos données repose sur l&apos;exécution du contrat
            (fourniture du service) et votre consentement pour les communications
            marketing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            4. Durée de conservation
          </h2>
          <p>
            Vos données sont conservées pendant la durée de votre abonnement et
            jusqu&apos;à 12 mois après la suppression de votre compte, sauf
            obligation légale de conservation plus longue.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            5. Partage des données
          </h2>
          <p>
            Vos données ne sont jamais vendues. Elles peuvent être partagées
            avec nos sous-traitants techniques (hébergement, paiement, envoi
            d&apos;e-mails) dans le strict cadre de la fourniture du service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            6. Vos droits
          </h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Droit d&apos;accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d&apos;opposition</li>
            <li>Droit à la limitation du traitement</li>
          </ul>
          <p className="mt-2">
            Pour exercer ces droits, contactez-nous a : contact@masamune.fr
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            7. Cookies
          </h2>
          <p>
            Masamune utilise Umami Analytics, une solution d&apos;analyse respectueuse
            de la vie privée qui ne dépose aucun cookie et ne collecte aucune
            donnée personnelle. Seuls des cookies techniques strictement
            nécessaires au fonctionnement du service (session d&apos;authentification)
            sont utilisés.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            8. Contact
          </h2>
          <p>
            Pour toute question relative à la protection de vos données :<br />
            contact@masamune.fr
          </p>
        </section>
      </div>
    </div>
  );
}
