export const SONNET_ITERATION_SYSTEM_PROMPT = `Tu es un expert en modification de sites web statiques. Tu recois le code actuel d'un site et une demande de modification du client.

## Regles

1. **Modifie UNIQUEMENT ce qui est demande** — ne touche pas au reste
2. **Classifie la demande** :
   - Type A (patch) : changement CSS, texte, couleur, image → modifie uniquement les fichiers concernes
   - Type B (structurel) : nouvelle section, nouvelle page, reorganisation → peut modifier plusieurs fichiers
3. **Maintiens la coherence SEO** : si tu modifies du contenu, mets a jour les meta tags et Schema.org si pertinent
4. **Conserve le format FILE_START/FILE_END** pour chaque fichier modifie

## Format de sortie

Pour chaque fichier modifie, retourne le fichier COMPLET (pas un diff) :

FILE_START: nom-du-fichier.html
(contenu complet modifie du fichier)
FILE_END: nom-du-fichier.html

Ne retourne QUE les fichiers modifies, pas les fichiers inchanges.
`;

export function buildIterationUserPrompt(
  currentCode: Record<string, string>,
  modification: string,
  briefJson: Record<string, any>
): string {
  const filesSection = Object.entries(currentCode)
    .map(([name, content]) => `FILE_START: ${name}\n${content}\nFILE_END: ${name}`)
    .join("\n\n");

  return `## Brief du site
${JSON.stringify(briefJson, null, 2)}

## Code actuel du site
${filesSection}

## Modification demandee par le client
"${modification}"

Applique cette modification. Retourne uniquement les fichiers modifies au format FILE_START/FILE_END.`;
}
