import * as R from "ramda";
import { getAnchorInit } from "utils/common";
import { getValitutKoodiarvot } from "../../services/lomakkeet/opiskelijavuodet/index";

// Magic constants

// 23 = Ei velvollisuutta järjestää tutkintoja ja valmentavaa
// koulutusta vaativaan erityiseen tukeen oikeutetuille opiskelijoille
const vaativatukiNotSelectedKoodiarvo = "23";

// Mikäli jokin näistä koodeista on valittuna osiossa 5, näytetään vaativaa tukea koskevat kentät osiossa 4.
export const vaativatCodes = ["2", "16", "17", "18", "19", "20", "21"];

// Default code value for sisaoppilaitoksen opiskelijamaaran rajoitus
export const sisaoppilaitosOpiskelijamaaraKoodiarvo = "4";
// Default code value for ylienen opiskelijamaaran rajoitus
export const vahimmaisopiskelijamaaraKoodiarvo = "3";

const vaativatukiSelectionAnchor =
  "muut_02.vaativatuki." + vaativatukiNotSelectedKoodiarvo;
const sisaoppilaitosSelectionAnchor =
  "muut_03.sisaoppilaitos." + sisaoppilaitosOpiskelijamaaraKoodiarvo;

const filterMaaraykset = maaraykset =>
  R.compose(
    R.filter(
      R.propEq("koodisto", "oivamuutoikeudetvelvollisuudetehdotjatehtavat")
    ),
    R.filter(R.propSatisfies(x => !!x, "koodiarvo"))
  )(maaraykset);

/**
 * Find vaativa tuki oppilasmaara rajoitus from maaraykset list
 * @param maaraykset
 * @returns vaativa tuki maarays or undefined
 */
export const findVaativatukiRajoitus = (maaraykset = []) =>
  R.find(
    R.propSatisfies(x => R.includes(x, vaativatCodes), "koodiarvo"),
    filterMaaraykset(maaraykset)
  );

/**
 * Find sisaoppilaitos oppilasmaara rajoitus from maaraykset list
 * @param maaraykset
 * @returns vaativa tuki maarays or undefined
 */
export const findSisaoppilaitosRajoitus = (maaraykset = []) =>
  R.find(
    R.propEq("koodiarvo", sisaoppilaitosOpiskelijamaaraKoodiarvo),
    filterMaaraykset(maaraykset)
  );

/**
 * Visible if maarays is found and not unchecked or maarays is not found and checked
 * @param maaraykset
 * @param changeObjects
 */
export const isSisaoppilaitosRajoitusVisible = (
  maaraykset = [],
  changeObjects = []
) => {
  const maarays = findSisaoppilaitosRajoitus(maaraykset);
  const isChecked = getStateOfIsCheckedProperty(
    sisaoppilaitosSelectionAnchor,
    changeObjects
  );
  return (maarays && isChecked !== false) || (!maarays && !!isChecked);
};

/**
 * Visible if maarays is found and last radio selection is not checked
 * @param maaraykset
 * @param changeObjects
 */
export const isVaativatukiRajoitusVisible = (lomakedataMuut = {}) => {
  /**
   * Jos radio button, jonka koodiarvo on jokin vaativatCodes-taulukon
   * arvoista, on aktiivinen, palauttaa tämä funktio arvon true. Se
   * tarkoittaa sitä, että vaativaa tukea koskeva opiskelijavuosimäärä
   * tulee lähettää backendille tietokantaan tallennettavaksi.
   **/
  const amountOfUnselectedVaativaTukiRadioButtons = R.length(
    R.difference(
      vaativatCodes,
      getValitutKoodiarvot(R.prop("02", lomakedataMuut))
    )
  );
  return amountOfUnselectedVaativaTukiRadioButtons < R.length(vaativatCodes);
};

const findChange = (anchorStart, changeObjects) =>
  R.find(R.compose(R.startsWith(anchorStart), R.prop("anchor")), changeObjects);

export const getStateOfIsCheckedProperty = (anchorStart, muutokset) =>
  R.path(["properties", "isChecked"], findChange(anchorStart, muutokset));

export function createBackendChangeObjects(
  changeObjects = {},
  kohde,
  maaraystyypit,
  muut,
  lupamuutokset,
  muutMuutokset,
  lomakedataMuut
) {
  // TODO: Fill perustelut and liitteet
  const muutMaaraykset = R.compose(
    R.prop("muutCombined"),
    R.head,
    R.values,
    R.filter(R.propEq("tunniste", "muut"))
  )(lupamuutokset);
  const unhandledChangeObjects =
    // Filter out opiskelijamaararajoitukset if they are not visible
    R.filter(changeObj => {
      const anchorInit = getAnchorInit(changeObj.anchor);
      if (anchorInit === "opiskelijavuodet.vaativatuki") {
        return isVaativatukiRajoitusVisible(lomakedataMuut);
      } else if (anchorInit === "opiskelijavuodet.sisaoppilaitos") {
        return isSisaoppilaitosRajoitusVisible(muutMaaraykset, muutMuutokset);
      }
      return true;
    }, changeObjects.muutokset);

  const uudetMuutokset = R.map(changeObj => {
    const anchorParts = R.split(".", changeObj.anchor);
    const koodiarvo = changeObj.properties.metadata.koodiarvo;
    let koodisto = { koodistoUri: "koulutussektori" };
    const isVahimmaismaara = R.equals(
      "vahimmaisopiskelijavuodet",
      R.nth(1, anchorParts)
    );
    if (!isVahimmaismaara) {
      koodisto = (R.find(R.propEq("koodiarvo", koodiarvo), muut) || {})
        .koodisto;
    }
    const anchorInit = getAnchorInit(changeObj.anchor);
    let anchor = "";
    if (anchorInit === "opiskelijavuodet.vahimmaisopiskelijavuodet") {
      anchor = "perustelut_opiskelijavuodet_vahimmaisopiskelijavuodet";
    } else if (anchorInit === "opiskelijavuodet.vaativatuki") {
      anchor = "perustelut_opiskelijavuodet_vaativatuki";
    } else if (anchorInit === "opiskelijavuodet.sisaoppilaitos") {
      anchor = "perustelut_opiskelijavuodet_sisaoppilaitos";
    }

    const perustelut = R.filter(
      R.compose(R.includes(anchor), R.prop("anchor")),
      changeObjects.perustelut
    );

    const perustelutForBackend = changeObjects;

    const perusteluteksti = perustelutForBackend
      ? null
      : R.map(perustelu => {
          if (R.path(["properties", "value"], perustelu)) {
            return { value: R.path(["properties", "value"], perustelu) };
          }
          return {
            value: R.path(["properties", "metadata", "fieldName"], perustelu)
          };
        }, perustelut);

    let meta = Object.assign(
      {},
      {
        tunniste: "opiskelijavuosimaara",
        changeObjects: R.flatten([[changeObj], perustelut]),
        muutosperustelukoodiarvo: []
      },
      perustelutForBackend,
      perusteluteksti ? { perusteluteksti } : null
    );

    let muutokset = [
      {
        arvo: changeObj.properties.applyForValue,
        kategoria: R.head(anchorParts),
        koodiarvo,
        koodisto: koodisto.koodistoUri,
        kohde,
        maaraystyyppi: isVahimmaismaara
          ? R.find(R.propEq("tunniste", "OIKEUS"), maaraystyypit)
          : R.find(R.propEq("tunniste", "RAJOITE"), maaraystyypit),
        meta,
        tila: "LISAYS"
      }
    ];

    // Add removal change if old maarays exists
    const maaraysUuid = R.path(
      ["properties", "metadata", "maaraysUuid"],
      changeObj
    );
    if (maaraysUuid) {
      muutokset = R.append({
        ...muutokset[0],
        meta: {},
        maaraysUuid: maaraysUuid,
        tila: "POISTO"
      })(muutokset);
    }

    return muutokset;
  }, unhandledChangeObjects).filter(Boolean);

  const rajoitukset = R.compose(
    R.prop("rajoitukset"),
    R.head,
    R.values,
    R.filter(R.propEq("tunniste", "opiskelijavuodet"))
  )(lupamuutokset);

  const generateMuutosFromMaarays = maarays => {
    return R.reject(R.isNil)({
      kategoria: "opiskelijavuodet",
      koodiarvo: maarays.koodiarvo,
      koodisto: maarays.koodisto,
      kohde: maarays.kohde,
      maaraysUuid: maarays.maaraysUuid,
      maaraystyyppi: R.find(R.propEq("tunniste", "RAJOITE"), maaraystyypit),
      meta: {},
      tila: "POISTO"
    });
  };

  // If last radio selection (23) is selected, vuosimaara should be removed
  if (getStateOfIsCheckedProperty(vaativatukiSelectionAnchor, muutMuutokset)) {
    const vaativatukiMaarays = findVaativatukiRajoitus(rajoitukset);
    if (vaativatukiMaarays) {
      uudetMuutokset.push(generateMuutosFromMaarays(vaativatukiMaarays));
    }
  }

  // If sisaoppilaitos is changed to false, vuosimaara should be removed
  if (
    getStateOfIsCheckedProperty(
      sisaoppilaitosSelectionAnchor,
      muutMuutokset
    ) === false
  ) {
    const sisaoppilaitosMaarays = findSisaoppilaitosRajoitus(rajoitukset);
    if (sisaoppilaitosMaarays) {
      uudetMuutokset.push(generateMuutosFromMaarays(sisaoppilaitosMaarays));
    }
  }

  return R.flatten([uudetMuutokset]);
}
