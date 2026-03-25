export const metadata = {
  title: "Politique de Confidentialite - Masamune",
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Politique de Confidentialite
      </h1>
      <p className="text-sm text-slate-400 mb-8">
        Derniere mise a jour : 25 mars 2026
      </p>
      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            1. Donnees collectees
          </h2>
          <p>
            Nous collectons les donnees suivantes lors de votre utilisation du
            service Masamune :
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Adresse e-mail (inscription et connexion)</li>
            <li>
              Informations de votre activite (fournies lors de la creation du
              site)
            </li>
            <li>Donnees de paiement (traitees par Stripe, non stockees chez nous)</li>
            <li>Donnees de navigation (via Umami Analytics, sans cookies)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            2. Finalites du traitement
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fourniture du service de creation et d&apos;hebergement de sites</li>
            <li>Gestion de votre compte et de votre abonnement</li>
            <li>Amelioration du service et statistiques d&apos;utilisation</li>
            <li>Communication relative au service (notifications, mises a jour)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            3. Base legale
          </h2>
          <p>
            Le traitement de vos donnees repose sur l&apos;execution du contrat
            (fourniture du service) et votre consentement pour les communications
            marketing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            4. Duree de conservation
          </h2>
          <p>
            Vos donnees sont conservees pendant la duree de votre abonnement et
            jusqu&apos;a 12 mois apres la suppression de votre compte, sauf
            obligation legale de conservation plus longue.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            5. Partage des donnees
          </h2>
          <p>
            Vos donnees ne sont jamais vendues. Elles peuvent etre partagees
            avec nos sous-traitants techniques (hebergement, paiement, envoi
            d&apos;e-mails) dans le strict cadre de la fourniture du service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            6. Vos droits
          </h2>
          <p>
            Conformement au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Droit d&apos;acces a vos donnees</li>
            <li>Droit de rectification</li>
            <li>Droit a l&apos;effacement</li>
            <li>Droit a la portabilite</li>
            <li>Droit d&apos;opposition</li>
            <li>Droit a la limitation du traitement</li>
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
            de la vie privee qui ne depose aucun cookie et ne collecte aucune
            donnee personnelle. Seuls des cookies techniques strictement
            necessaires au fonctionnement du service (session d&apos;authentification)
            sont utilises.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            8. Contact
          </h2>
          <p>
            Pour toute question relative a la protection de vos donnees :<br />
            contact@masamune.fr
          </p>
        </section>
      </div>
    </div>
  );
}
