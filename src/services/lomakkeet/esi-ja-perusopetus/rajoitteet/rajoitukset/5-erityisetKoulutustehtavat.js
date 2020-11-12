import { getPOErityisetKoulutustehtavatFromStorage } from "helpers/poErityisetKoulutustehtavat";
import { getChangeObjByAnchor } from "../../../../../components/02-organisms/CategorizedListRoot/utils";
import { map,toUpper } from "ramda";

export default async function opetuksenjarjestamismuodot(
  changeObjects = [],
  locale
) {
  const erityisetKoulutustehtavat = await getPOErityisetKoulutustehtavatFromStorage();
  const localeUpper = toUpper(locale);

  if (erityisetKoulutustehtavat.length) {
    return {
      anchor: "rajoitus",
      components: [
        {
          anchor: "opetuksenJarjestamismuodot",
          name: "Autocomplete",
          properties: {
            options: map((erityisetKoulutustehtavat) => {
              const maarays = false; // TO DO: Etsi opetustehtävää koskeva määräys
              const anchor = `erityisetKoulutustehtavat.${erityisetKoulutustehtavat.koodiarvo}.valintaelementti`;
              const changeObj = getChangeObjByAnchor(anchor, changeObjects);
              console.log("@"+anchor);
              console.log(changeObj);
              console.log(changeObjects);
              return (!!maarays &&
                (!changeObj || changeObj.properties.isChecked)) ||
                (changeObj && changeObj.properties.isChecked)
                ? {
                    label: erityisetKoulutustehtavat.metadata[localeUpper].nimi,
                    value: erityisetKoulutustehtavat.koodiarvo
                  }
                : null;
            }, erityisetKoulutustehtavat).filter(Boolean),
            value: ""
          }
        }
      ]
    };
  } else {
    return {
      anchor: "ei-valintamahdollisuutta",
      components: [
        {
          anchor: "teksti",
          name: "StatusTextRow",
          properties: {
            title: "Ei valintamahdollisuutta."
          }
        }
      ]
    };
  }
}