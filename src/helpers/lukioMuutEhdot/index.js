import {
  compose,
  concat,
  drop,
  endsWith,
  filter,
  find,
  flatten,
  groupBy,
  head,
  includes,
  isEmpty,
  isNil,
  length,
  map,
  mapObjIndexed,
  nth,
  omit,
  path,
  prop,
  propEq,
  reject,
  sort,
  split,
  startsWith,
  take,
  values
} from "ramda";
import { getMaarayksetByTunniste} from "../lupa/index";
import localforage from "localforage";
import { createAlimaarayksetBEObjects } from "helpers/rajoitteetHelper";
import { createMaarayksiaVastenLuodutRajoitteetDynaamisilleTekstikentilleBEObjects } from "../../utils/rajoitteetUtils";

export const initializeLukioMuuEhto = ehto => {
  return omit(["koodiArvo"], {
    ...ehto,
    koodiarvo: ehto.koodiArvo,
    metadata: mapObjIndexed(head, groupBy(prop("kieli"), ehto.metadata))
  });
};

export const initializeLukioMuutEhdot = ehdot => {
  return sort(
    (a, b) => {
      const aInt = parseInt(a.koodiarvo, 10);
      const bInt = parseInt(b.koodiarvo, 10);
      if (aInt < bInt) {
        return -1;
      } else if (aInt > bInt) {
        return 1;
      }
      return 0;
    },
    map(ehto => {
      return initializeLukioMuuEhto(ehto);
    }, ehdot)
  );
};

export function getLukioMuutEhdotFromStorage() {
  return localforage.getItem(
    "lukioMuutKoulutuksenJarjestamiseenLiittyvatEhdot"
  );
}

export const defineBackendChangeObjects = async (
  changeObjects = [],
  maaraystyypit,
  lupaMaaraykset,
  locale,
  kohteet
) => {
  const maaraykset = await getMaarayksetByTunniste(
    "muutkoulutuksenjarjestamiseenliittyvatehdot",
    lupaMaaraykset
  )

  const { rajoitteetByRajoiteId } = changeObjects;

  const kohde = find(
    propEq("tunniste", "muutkoulutuksenjarjestamiseenliittyvatehdot"),
    kohteet
  );
  const maaraystyyppi = find(propEq("tunniste", "OIKEUS"), maaraystyypit);
  const muutEhdot = await getLukioMuutEhdotFromStorage();

  const muutokset = map(ehto => {
    // Checkbox-kenttien muutokset
    const checkboxChangeObj = find(
      compose(endsWith(`.${ehto.koodiarvo}.valintaelementti`), prop("anchor")),
      changeObjects.muutEhdot
    );

    // Kuvauskenttien muutokset kohdassa (muu ehto)
    const kuvausChangeObjects = filter(changeObj => {
      return (
        ehto.koodiarvo ===
          path(["metadata", "koodiarvo"], changeObj.properties) &&
        endsWith(".kuvaus", changeObj.anchor)
      );
    }, changeObjects.muutEhdot);

    let checkboxBEchangeObject = null;
    let kuvausBEchangeObjects = [];

    const rajoitteetByRajoiteIdAndKoodiarvo = reject(
      isNil,
      mapObjIndexed(rajoite => {
        return startsWith(
          `${ehto.koodiarvo}-`,
          path([1, "properties", "value", "value"], rajoite)
        )
          ? rajoite
          : null;
      }, rajoitteetByRajoiteId)
    );

    if (length(kuvausChangeObjects)) {
      kuvausBEchangeObjects = map(changeObj => {
        const ankkuri = path(["properties", "metadata", "ankkuri"], changeObj);
        const kuvausBEChangeObject = {
          generatedId: changeObj.anchor,
          kohde,
          koodiarvo: ehto.koodiarvo,
          koodisto: ehto.koodisto.koodistoUri,
          kuvaus: changeObj.properties.value,
          maaraystyyppi,
          meta: {
            ankkuri,
            kuvaus: changeObj.properties.value,
            changeObjects: flatten(
              concat(take(2, values(rajoitteetByRajoiteIdAndKoodiarvo)), [
                checkboxChangeObj,
                changeObj
              ])
            ).filter(Boolean)
          },
          tila: path(["properties", "isChecked"], checkboxChangeObj)
            ? "LISAYS"
            : "POISTO"
        };

        let alimaaraykset = [];

        const kohteenTarkentimenArvo = path(
          [1, "properties", "value", "value"],
          head(values(rajoitteetByRajoiteIdAndKoodiarvo))
        );

        const rajoitevalinnanAnkkuriosa = kohteenTarkentimenArvo
          ? nth(1, split("-", kohteenTarkentimenArvo))
          : null;

        if (
          kohteenTarkentimenArvo &&
          (rajoitevalinnanAnkkuriosa === ankkuri || !rajoitevalinnanAnkkuriosa)
        ) {
          // Muodostetaan tehdyistä rajoittuksista objektit backendiä varten.
          // Linkitetään ensimmäinen rajoitteen osa yllä luotuun muutokseen ja
          // loput toisiinsa "alenevassa polvessa".
          alimaaraykset = values(
            mapObjIndexed(asetukset => {
              return createAlimaarayksetBEObjects(
                kohteet,
                maaraystyypit,
                kuvausBEChangeObject,
                drop(2, asetukset)
              );
            }, rajoitteetByRajoiteIdAndKoodiarvo)
          );
        }

        return [kuvausBEChangeObject, alimaaraykset];
      }, kuvausChangeObjects);
    } else {
      // Jos muokattuja kuvauksia ei kyseiselle koodiarvolle löydy, tarkistetaan
      // löytyykö checkbox-muutos. Jos löytyy, niin luodaan sille backend-muotoinen
      // muutosobjekti.
      checkboxBEchangeObject = checkboxChangeObj
        ? {
            generatedId: `muuEhto-${Math.random()}`,
            kohde,
            koodiarvo: ehto.koodiarvo,
            koodisto: ehto.koodisto.koodistoUri,
            kuvaus: ehto.metadata[locale].kuvaus,
            maaraystyyppi,
            meta: {
              changeObjects: flatten(
                concat(take(2, values(rajoitteetByRajoiteIdAndKoodiarvo)), [
                  checkboxChangeObj
                ])
              ).filter(Boolean)
            },
            tila: checkboxChangeObj.properties.isChecked ? "LISAYS" : "POISTO"
          }
        : null;

      // Muodostetaan tehdyistä rajoittuksista objektit backendiä varten.
      // Linkitetään ensimmäinen rajoitteen osa yllä luotuun muutokseen ja
      // loput toisiinsa "alenevassa polvessa".
      const alimaaraykset =
        checkboxBEchangeObject && !isEmpty(rajoitteetByRajoiteIdAndKoodiarvo)
          ? values(
              mapObjIndexed(asetukset => {
                return createAlimaarayksetBEObjects(
                  kohteet,
                  maaraystyypit,
                  checkboxBEchangeObject,
                  drop(2, asetukset)
                );
              }, rajoitteetByRajoiteIdAndKoodiarvo)
            )
          : null;

      return [checkboxBEchangeObject, alimaaraykset];
    }

    return [checkboxBEchangeObject, kuvausBEchangeObjects];
  }, muutEhdot);

  /**
   * Lisätiedot-kenttä tulee voida tallentaa ilman, että osioon on tehty muita
   * muutoksia. Siksi kentän tiedoista luodaan tässä kohtaa oma backend-
   * muotoinen muutosobjekti.
   */
  const lisatiedotChangeObj = find(
    compose(includes(".lisatiedot."), prop("anchor")),
    changeObjects.muutEhdot
  );

  const lisatiedotBEchangeObject = lisatiedotChangeObj
    ? {
        kohde,
        koodiarvo: path(
          ["properties", "metadata", "koodiarvo"],
          lisatiedotChangeObj
        ),
        koodisto: path(
          ["properties", "metadata", "koodisto", "koodistoUri"],
          lisatiedotChangeObj
        ),
        maaraystyyppi,
        meta: {
          arvo: path(["properties", "value"], lisatiedotChangeObj),
          changeObjects: [lisatiedotChangeObj]
        },
        tila: "LISAYS"
      }
    : null;

  const maarayksiaVastenLuodutRajoitteet = createMaarayksiaVastenLuodutRajoitteetDynaamisilleTekstikentilleBEObjects(
    maaraykset,
    rajoitteetByRajoiteId,
    kohteet,
    maaraystyypit,
    kohde
  );

  const objects = flatten([maarayksiaVastenLuodutRajoitteet, muutokset, lisatiedotBEchangeObject]).filter(
    Boolean
  );

  return objects;
};
