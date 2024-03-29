import {
  append,
  endsWith,
  filter,
  find,
  flatten,
  map,
  nth,
  pathEq,
  prop,
  split,
  startsWith
} from "ramda";
import { getAnchorPart, removeAnchorPart } from "utils/common";
import Lisatiedot from "../../lisatiedot";
import { createEsikatseluHTML } from "../../../../helpers/esikatselu";

export const previewOfDynaamisetTekstikentat = (
  { lomakedata, rajoitteet, maaraykset },
  booleans,
  locale
) => {
  let structure = [];

  const checkedNodes = filter(
    pathEq(["properties", "isChecked"], true),
    lomakedata
  );

  const anchorsOfCheckedNodes = map(prop("anchor"), checkedNodes);

  if (anchorsOfCheckedNodes.length) {
    /**
     * Yhtä checkbox-valintaa kohden voi olla useita kuvauksia. Etsitään ne.
     */
    const kuvausNodes = flatten(
      map(anchor => {
        const anchorRelatedDescriptionNodes = filter(node => {
          return (
            startsWith(`${removeAnchorPart(anchor, 2)}.`, node.anchor) &&
            endsWith(".kuvaus", node.anchor)
          );
        }, lomakedata);
        return anchorRelatedDescriptionNodes;
      }, anchorsOfCheckedNodes).filter(Boolean)
    );

    if (kuvausNodes.length) {
      structure = append(
        {
          anchor: "valittu",
          components: [
            {
              anchor: "A",
              name: "List",
              properties: {
                items: map(node => {
                  const anchorParts = split(".", node.anchor);
                  const koodiarvo = getAnchorPart(node.anchor, 1);
                  const kuvausnumero = getAnchorPart(node.anchor, 2);
                  const maarays = find(
                    maarays =>
                      maarays.koodiarvo === koodiarvo &&
                      pathEq(["meta", "ankkuri"], kuvausnumero, maarays),
                    maaraykset
                  );

                  const html = createEsikatseluHTML(
                    maarays,
                    `${koodiarvo}-${kuvausnumero}`,
                    rajoitteet,
                    locale,
                    "nimi",
                    node.properties.value
                  );

                  return {
                    anchor: koodiarvo,
                    components: [
                      {
                        anchor: nth(2, anchorParts),
                        name: "HtmlContent",
                        properties: { content: html }
                      }
                    ]
                  };
                }, kuvausNodes)
              }
            }
          ]
        },
        structure
      );
    }
  }

  const lisatiedotNode = find(
    node => endsWith(".lisatiedot.1", node.anchor),
    lomakedata
  );

  if (lisatiedotNode && lisatiedotNode.properties.value) {
    structure = append(Lisatiedot(lisatiedotNode.properties.value), structure);
  }

  return structure;
};
