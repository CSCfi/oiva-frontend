import { getLukioErityisetKoulutustehtavatFromStorage } from "helpers/lukioErityisetKoulutustehtavat/index";
import { getPOErityisetKoulutustehtavatFromStorage } from "helpers/poErityisetKoulutustehtavat/index";
import {
  compose,
  endsWith,
  filter,
  find,
  flatten,
  map,
  path,
  prop,
  toUpper
} from "ramda";
import { getAnchorPart } from "utils/common";

export default async function getErityisetKoulutustehtavat(
  isReadOnly,
  osionData = [],
  locale,
  voidaankoValitaUseita,
  inputId,
  koulutustyyppi
) {
  const localeUpper = toUpper(locale);
  let erityisetKoulutustehtavat = [];

  if (koulutustyyppi === "1") {
    // 1 = esi- ja perusopetus
    erityisetKoulutustehtavat = await getPOErityisetKoulutustehtavatFromStorage();
  } else if (koulutustyyppi === "2") {
    // 2 = lukiokoulutus
    erityisetKoulutustehtavat = await getLukioErityisetKoulutustehtavatFromStorage();
  }

  if (erityisetKoulutustehtavat.length) {
    return [
      {
        anchor: "komponentti",
        name: "Autocomplete",
        styleClasses: ["w-4/5", "xl:w-2/3", "mb-6"],
        properties: {
          forChangeObject: {
            section: "erityisetKoulutustehtavat"
          },
          inputId,
          isMulti: voidaankoValitaUseita,
          isReadOnly,
          options: flatten(
            map(erityinenKoulutustehtava => {
              /**
               * Tarkistetaan, onko kyseinen erityinen koulutustehtävä
               * valittuna lomakkeella, jota vasten rajoituksia ollaan
               * tekemässä.
               **/
              const stateObj = find(
                compose(
                  endsWith(
                    `.${erityinenKoulutustehtava.koodiarvo}.valintaelementti`
                  ),
                  prop("anchor")
                ),
                osionData
              );

              if (stateObj && stateObj.properties.isChecked) {
                // Vaihtoehtoina näytetään kuvaukset, joten ne
                // on kaivettava osion datasta koodiarvolla.
                const kuvausStateObjects = filter(stateObj => {
                  return (
                    getAnchorPart(stateObj.anchor, 1) ===
                      erityinenKoulutustehtava.koodiarvo &&
                    endsWith(".kuvaus", stateObj.anchor)
                  );
                }, osionData);

                /** Näytetään kuvaukset erityisille koulutustehtäville, joilla on koodistossa
                 * muuttujassa metadata.FI.kayttoohje arvo "Kuvaus". Muille näytetään nimi
                 */
                return map(stateObj => {
                    return path(
                      ["metadata", "FI", "kayttoohje"],
                      erityinenKoulutustehtava
                    ) === "Kuvaus" ? {
                      value: `${getAnchorPart(
                        stateObj.anchor,
                        1
                      )}-${getAnchorPart(stateObj.anchor, 2)}`,
                      label: stateObj.properties.value,
                      useKuvausInRajoite: true
                    } : {
                      label:
                      erityinenKoulutustehtava.metadata[localeUpper].nimi,
                      value: `${erityinenKoulutustehtava.koodiarvo}-0`,
                      kuvaus: stateObj.properties.value,
                      useKuvausInRajoite: false
                    }
                  }, kuvausStateObjects);
              }

              return null;
            }, erityisetKoulutustehtavat).filter(Boolean)
          ),
          value: ""
        }
      }
    ];
  } else {
    return [
      {
        anchor: "teksti",
        name: "StatusTextRow",
        properties: {
          title: "Ei valintamahdollisuutta."
        }
      }
    ];
  }
}
