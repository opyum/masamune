export const metadata = {
  title: "Mentions légales - Masamune",
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Mentions légales
      </h1>
      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Éditeur du site
          </h2>
          <p>
            Masamune SAS<br />
            [Adresse à compléter]<br />
            SIRET : [À compléter]<br />
            RCS : [À compléter]<br />
            Capital social : [À compléter]
          </p>
          <p>
            Directeur de la publication : [Nom à compléter]<br />
            Contact : contact@masamune.fr
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Hébergement
          </h2>
          <p>
            Le site masamune.fr est hébergé par :<br />
            [Nom de l&apos;hébergeur]<br />
            [Adresse de l&apos;hébergeur]
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des contenus (textes, images, logos, éléments graphiques)
            présentés sur le site masamune.fr sont protégés par les lois
            relatives à la propriété intellectuelle. Toute reproduction, même
            partielle, est interdite sans autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Données personnelles
          </h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de
            suppression de vos données personnelles. Pour exercer ce droit,
            contactez-nous à : contact@masamune.fr
          </p>
        </section>
      </div>
    </div>
  );
}
