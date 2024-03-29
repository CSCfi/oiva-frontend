import {
  any,
  mapObjIndexed,
  groupBy,
  prop,
  dissoc,
  head,
  map,
  find,
  propEq,
  path,
  startsWith,
  filter,
  compose,
  includes,
  flatten,
  pathEq,
  reject,
  isNil,
  values,
  concat,
  take,
  toLower,
  drop,
  equals
} from "ramda";
import localforage from "localforage";
import { getLisatiedotFromStorage } from "../lisatiedot";
import { createAlimaarayksetBEObjects } from "helpers/rajoitteetHelper";
import { getLocalizedProperty } from "../../services/lomakkeet/utils";
import { createMaarayksiaVastenLuodutRajoitteetBEObjects } from "utils/rajoitteetUtils";
import { getMaarayksetByTunniste } from "helpers/lupa/index";

export const initializeMaarays = (tutkinto, maarays) => {
  return { ...tutkinto, maarays: head(dissoc("aliMaaraykset", maarays)) };
};

export const initializeOpetuskieli = ({
  koodiArvo: koodiarvo,
  koodisto,
  metadata,
  versio,
  voimassaAlkuPvm
}) => {
  return {
    koodiarvo,
    koodisto,
    metadata: mapObjIndexed(head, groupBy(prop("kieli"), metadata)),
    versio,
    voimassaAlkuPvm
  };
};

export const initializeOpetuskielet = (opetuskieletData, maaraykset = []) => {
  const maarayksetByOpetuskieli = groupBy(prop("koodiarvo"), maaraykset);
  return opetuskieletData
    ? map(opetuskielidata => {
        // Luodaan opetuskieli
        let opetuskieli = initializeOpetuskieli(opetuskielidata);

        // Asetetaan opetuskielelle määräys
        opetuskieli = initializeMaarays(
          opetuskieli,
          maarayksetByOpetuskieli[opetuskieli.koodiarvo]
        );

        return opetuskieli;
      }, opetuskieletData)
    : [];
};

export const defineBackendChangeObjects = async (
  changeObjects = {},
  kohde,
  maaraystyypit,
  lupaMaaraykset,
  locale,
  kohteet
) => {
  const maaraykset = await getMaarayksetByTunniste(
    kohde.tunniste,
    lupaMaaraykset
  );
  const opetuskielet = await getEnsisijaisetOpetuskieletOPHFromStorage();
  const lisatiedot = await getLisatiedotFromStorage();
  const { rajoitteetByRajoiteId } = changeObjects;

  const lisatiedotObj = find(
    pathEq(["koodisto", "koodistoUri"], "lisatietoja"),
    lisatiedot || []
  );

  const opetuskieletChangeObjs = filter(
    compose(startsWith("opetuskielet.opetuskieli"), prop("anchor")),
    changeObjects.opetuskielet
  );

  /** Lisätietokentän käsittely */
  const lisatiedotChangeObj = find(
    compose(includes(".lisatiedot."), prop("anchor")),
    changeObjects.opetuskielet
  );

  const lisatiedotBeChangeObj = lisatiedotChangeObj
    ? {
        kohde: find(propEq("tunniste", "opetuskieli"), kohteet),
        koodiarvo: lisatiedotObj.koodiarvo,
        koodisto: lisatiedotObj.koodisto.koodistoUri,
        kuvaus: getLocalizedProperty(
          lisatiedotChangeObj.metadata,
          locale,
          "kuvaus"
        ),
        maaraystyyppi: find(propEq("tunniste", "OIKEUS"), maaraystyypit),
        meta: {
          arvo: path(["properties", "value"], lisatiedotChangeObj),
          changeObjects: [lisatiedotChangeObj]
        },
        tila: "LISAYS"
      }
    : [];

  /** Opetuskielten käsittely */
  const opetuskieliBeChangeObjects = map(opetuskieli => {
    const changeObj = find(
      cObj =>
        find(
          kieli => kieli.value === opetuskieli.koodiarvo,
          cObj.properties.value
        ),
      opetuskieletChangeObjs
    );

    const rajoitteetByRajoiteIdAndKoodiarvo = reject(
      isNil,
      mapObjIndexed(rajoite => {
        return pathEq(
          [1, "properties", "value", "value"],
          opetuskieli.koodiarvo,
          rajoite
        )
          ? rajoite
          : null;
      }, rajoitteetByRajoiteId)
    );

    const maarays = find(
      maarays => maarays.koodiarvo.toLowerCase() === opetuskieli.koodiarvo.toLowerCase(),
      maaraykset
    );

    const isValikkoChanged = any(change => {
      return equals(
        path(["properties", "metadata", "valikko"], change),
        path(["meta", "valikko"], maarays)
      );
    }, opetuskieletChangeObjs);

    let muutosobjekti = null;

    if (changeObj && !maarays) {
      // Kokonaan uusi kielivalinta
      muutosobjekti = {
        generatedId: `opetuskielet-${Math.random()}`,
        kohde: find(propEq("tunniste", "opetuskieli"), kohteet),
        koodiarvo: toLower(opetuskieli.koodiarvo),
        koodisto: opetuskieli.koodisto.koodistoUri,
        maaraystyyppi: find(propEq("tunniste", "OIKEUS"), maaraystyypit),
        meta: {
          changeObjects: concat(
            [changeObj],
            take(2, values(rajoitteetByRajoiteIdAndKoodiarvo))
          ),
          ...(changeObj ? { valikko: path(["properties", "metadata", "valikko"], changeObj) } : null)
        },
        tila: "LISAYS"
      };
    } else if (maarays && !changeObj && isValikkoChanged) {
      // Luvalta löytyvä kielivalinta jonka valikko on muuttunut, mutta ei ole muutosobjektia.
      muutosobjekti = {
        generatedId: `opetuskielet-${Math.random()}`,
        kohde: find(propEq("tunniste", "opetuskieli"), kohteet),
        koodiarvo: toLower(opetuskieli.koodiarvo),
        koodisto: opetuskieli.koodisto.koodistoUri,
        maaraystyyppi: find(propEq("tunniste", "OIKEUS"), maaraystyypit),
        meta: {
          changeObjects: opetuskieletChangeObjs,
          ...(changeObj ? { valikko: path(["properties", "metadata", "valikko"], changeObj) } : null)
        },
        maaraysUuid: maarays.uuid,
        tila: "POISTO"
      };
    }

    // Muodostetaan tehdyistä rajoittuksista objektit backendiä varten.
    // Linkitetään ensimmäinen rajoitteen osa yllä luotuun muutokseen ja
    // loput toisiinsa "alenevassa polvessa".
    const alimaaraykset = muutosobjekti
      ? values(
          mapObjIndexed(asetukset => {
            return createAlimaarayksetBEObjects(
              kohteet,
              maaraystyypit,
              muutosobjekti,
              drop(2, asetukset)
            );
          }, rajoitteetByRajoiteIdAndKoodiarvo)
        )
      : [];

    return [muutosobjekti, alimaaraykset];
  }, opetuskielet);

  const maarayksiaVastenLuodutRajoitteet = createMaarayksiaVastenLuodutRajoitteetBEObjects(
    maaraykset,
    rajoitteetByRajoiteId,
    kohteet,
    maaraystyypit,
    kohde
  );

  return flatten([
    maarayksiaVastenLuodutRajoitteet,
    lisatiedotBeChangeObj,
    opetuskieliBeChangeObjects
  ]).filter(Boolean);
};

export function getEnsisijaisetOpetuskieletOPHFromStorage() {
  return localforage.getItem("ensisijaisetOpetuskieletOPH");
}

export function getToissijaisetOpetuskieletOPHFromStorage() {
  return localforage.getItem("toissijaisetOpetuskieletOPH");
}

export function getOpetuskieletFromStorage() {
  return localforage.getItem("opetuskielet");
}

export function getKieletOPHFromStorage() {
  return localforage.getItem("kieletOPH");
}
