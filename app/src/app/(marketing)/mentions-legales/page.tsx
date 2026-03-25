export const metadata = {
  title: "Mentions legales - Masamune",
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Mentions legales
      </h1>
      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Editeur du site
          </h2>
          <p>
            Masamune SAS<br />
            [Adresse a completer]<br />
            SIRET : [A completer]<br />
            RCS : [A completer]<br />
            Capital social : [A completer]
          </p>
          <p>
            Directeur de la publication : [Nom a completer]<br />
            Contact : contact@masamune.fr
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Hebergement
          </h2>
          <p>
            Le site masamune.fr est heberge par :<br />
            [Nom de l&apos;hebergeur]<br />
            [Adresse de l&apos;hebergeur]
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Propriete intellectuelle
          </h2>
          <p>
            L&apos;ensemble des contenus (textes, images, logos, elements graphiques)
            presentes sur le site masamune.fr sont proteges par les lois
            relatives a la propriete intellectuelle. Toute reproduction, meme
            partielle, est interdite sans autorisation prealable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Donnees personnelles
          </h2>
          <p>
            Conformement au Reglement General sur la Protection des Donnees
            (RGPD), vous disposez d&apos;un droit d&apos;acces, de rectification et de
            suppression de vos donnees personnelles. Pour exercer ce droit,
            contactez-nous a : contact@masamune.fr
          </p>
        </section>
      </div>
    </div>
  );
}
