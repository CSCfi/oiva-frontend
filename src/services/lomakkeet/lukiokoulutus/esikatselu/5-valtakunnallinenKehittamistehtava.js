import { append, endsWith, find, map } from "ramda";
import { getAnchorPart } from "utils/common";
import { getRajoite } from "utils/rajoitteetUtils";

export async function previewOfValtakunnallinenKehittamistehtava({
  lomakedata,
  rajoitteet
}) {
  let structure = [];

  if (!lomakedata || !lomakedata.length) {
    return structure;
  }
  /**
   * Muodostetaan lista-alkiot hyödyntäen ListItem-komponenttiamme.
   * Huomioidaan vain opetustehtävät, jotka ovat aktivoituina lomakkeella
   * (!!isChecked = true).
   */
  const listItems = map(opetustehtava => {
    const koodiarvo = getAnchorPart(opetustehtava.anchor, 2);
    const { rajoiteId, rajoite } = getRajoite(koodiarvo, rajoitteet);

    // Listaus voi pitää sisällään joko rajoitteita tai päälomakkeelta
    // valittuja arvoja (ilman rajoittteita)
    if (opetustehtava.properties.isChecked) {
      return {
        anchor: koodiarvo,
        components: [
          rajoite
            ? {
                anchor: "rajoite",
                name: "Rajoite",
                properties: {
                  areTitlesVisible: false,
                  isReadOnly: true,
                  rajoiteId,
                  rajoite
                }
              }
            : {
                anchor: "opetustehtava",
                name: "HtmlContent",
                properties: {
                  content: opetustehtava.properties.title
                }
              }
        ]
      };
    }
  }, lomakedata).filter(Boolean);

  if (listItems.length) {
    structure = append(
      {
        anchor: "valitut",
        components: [
          {
            anchor: "listaus",
            name: "List",
            properties: {
              isDense: true,
              items: listItems
            }
          }
        ]
      },
      structure
    );
  }

  const lisatiedotNode = find(
    node => endsWith(".lisatiedot.1", node.anchor),
    lomakedata
  );

  if (lisatiedotNode && lisatiedotNode.properties.value) {
    structure = append(
      {
        anchor: "lisatiedot",
        components: [
          {
            anchor: "A",
            name: "StatusTextRow",
            properties: {
              title: lisatiedotNode.properties.value
            }
          }
        ]
      },
      structure
    );
  }

  return structure;
}
