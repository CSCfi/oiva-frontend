import {
  append,
  compose,
  addIndex,
  concat,
  endsWith,
  filter,
  find,
  findIndex,
  flatten,
  head,
  includes,
  isNil,
  last,
  length,
  map,
  nth,
  path,
  pipe,
  prop,
  propEq,
  reject,
  split,
  test,
  toLower,
  uniqBy,
  pathEq,
  drop,
  clone
} from "ramda";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { getAnchorPart } from "../utils/common";
import { koulutustyypitMap } from "../utils/constants";

const koodistoMappingLukio = {
  maaraaika: "kujalisamaareet",
  oppilaitokset: "oppilaitos",
  toimintaalue: "kunta",
  opetuskielet: "kielikoodistoopetushallinto",
  oikeusSisaoppilaitosmuotoiseenKoulutukseen:
    "lukiooikeussisaooppilaitosmuotoiseenkoulutukseen",
  erityisetKoulutustehtavat: "lukioerityinenkoulutustehtavauusi",
  muutEhdot: "lukiomuutkoulutuksenjarjestamiseenliittyvatehdot"
};

const koodistoMappingPo = {
  maaraaika: "kujalisamaareet",
  opetustehtavat: "opetustehtava",
  oppilaitokset: "oppilaitos",
  toimintaalue: "kunta",
  opetuskielet: "kielikoodistoopetushallinto",
  opetuksenJarjestamismuodot: "opetuksenjarjestamismuoto",
  erityisetKoulutustehtavat: "poerityinenkoulutustehtava",
  muutEhdot: "pomuutkoulutuksenjarjestamiseenliittyvatehdot"
};

function isAsetusKohdennuksenKohdennus(asetusChangeObj) {
  return test(
    /^.+kohdennukset\.\d\.kohdennukset\.\d\.kohde/,
    prop("anchor", asetusChangeObj)
  );
}

export const createAlimaarayksetBEObjects = (
  kohteet,
  maaraystyypit,
  paalomakkeenBEMuutos, // myöhemmin lomakedata käyttöön
  asetukset,
  muutosobjektit = [],
  index = 0,
  kohdennuksenKohdeNumber = 0,
  insideMulti = false
) => {
  const isMaarays = prop("isMaarays", paalomakkeenBEMuutos) || false;
  let asetuksetFromMaarays = null;
  if(isMaarays) {
    asetuksetFromMaarays = clone(asetukset);
    asetukset = drop(2, asetukset);
  }
  /** Haetaan kohteista koulutustyyppi. Tämän perusteella käytetään oikeata koodistoMappingia */
  const koodistoMapping =
    path(["0", "koulutustyyppi"], kohteet) ===
    koulutustyypitMap.ESI_JA_PERUSOPETUS
      ? koodistoMappingPo
      : koodistoMappingLukio;

  const rajoiteId = compose(
    last,
    split("_"),
    cObj => getAnchorPart(cObj.anchor, 0),
    head
  )(asetukset);
  let offset = 2;
  const asetusChangeObj = nth(index, asetukset);
  const valueChangeObj = nth(index + 1, asetukset);
  const valueOfValueChangeObj = path(["properties", "value"], valueChangeObj);
  const valueValueOfAsetusChangeObj = path(
    ["properties", "value", "value"],
    asetusChangeObj
  );
  const sectionOfAsetusChangeObj =
    path(["properties", "metadata", "section"], asetusChangeObj) ||
    valueValueOfAsetusChangeObj;

  let koodiarvo =
    path(["properties", "value", "value"], valueChangeObj) ||
    path(["properties", "metadata", "koodiarvo"], asetusChangeObj);

  // Käsittele aikamääre rajoite
  let alkupvm = null;
  let loppupvm = null;
  if (valueValueOfAsetusChangeObj && includes("kujalisamaareetlisaksiajalla", valueValueOfAsetusChangeObj)) {
    offset = 3;
    alkupvm =
      path(
        ["properties", "value"],
        find(compose(endsWith(".alkamispaiva"), prop("anchor")), asetukset)
      ) || valueOfValueChangeObj;

    loppupvm =
      path(
        ["properties", "value"],
        find(compose(endsWith(".paattymispaiva"), prop("anchor")), asetukset)
      ) || pipe(nth(index + 2), path(["properties", "value"]))(asetukset);
  }

  let koodisto = "";

  if (valueValueOfAsetusChangeObj) {
    // Kyseessä voi olla pudotusvalikko, jolloin koodiston arvo löytyy
    // pudotusvalikosta valitun arvon perusteella { label: ..., value: X }
    koodisto =
      prop(valueValueOfAsetusChangeObj, koodistoMapping) ||
      head(split("_", valueValueOfAsetusChangeObj));

    if (koodisto === "oppilaitos") {
      koodiarvo = "1";
    } else {
      koodiarvo = koodiarvo || last(split("_", valueValueOfAsetusChangeObj));
    }
  } else if (sectionOfAsetusChangeObj) {
    // Jossain tapauksessa elementti ei ole pudotusvalikko, joten
    // koodistoarvo tulee etsiä toisella tavalla. Tällaisissa tapauksissa
    // voidaan hyödyntää muutosobjektin metadataa, jonne tieto on kenties
    // laitettu talteen.
    koodisto = prop(sectionOfAsetusChangeObj, koodistoMapping);
  }

  const tunniste = path(["kohde", "tunniste"], paalomakkeenBEMuutos);

  const isKohdennuksenKohdennus = isAsetusKohdennuksenKohdennus(
    asetusChangeObj
  );
  if (isKohdennuksenKohdennus) {
    kohdennuksenKohdeNumber += 1;
    insideMulti = false;
  }
  const nextKohdennuksenKohdennusIndex = findIndex(asetus => {
    return test(
      new RegExp(
        `^.+kohdennukset\\.\\d\\.kohdennukset\\.${kohdennuksenKohdeNumber}\\.kohde`
      ),
      asetus.anchor
    );
  })(asetukset);
  const alimaarayksenParent =
    index === 0
      ? prop("generatedId", paalomakkeenBEMuutos)
      : isKohdennuksenKohdennus
      ? prop("generatedId", head(muutosobjektit))
      : prop("generatedId", last(muutosobjektit));

  let arvo = valueChangeObj && endsWith("lukumaara", path(["anchor"], valueChangeObj))
    ? valueOfValueChangeObj
    : null;

  const multiSelectValues = Array.isArray(valueOfValueChangeObj)
    ? valueOfValueChangeObj
    : [valueOfValueChangeObj];
  const mapIndex = addIndex(map);

  const multiSelectUuid = length(multiSelectValues) > 1 ? uuidv4() : null;

  const result = pipe(
    mapIndex((multiselectValue, multiIndex) => {
      let codeValue = "";
      if (koodisto === "oppilaitos") {
        codeValue = koodiarvo;
      } else {
        if (prop("value", multiselectValue)) {
          /** Dynaamisilla tekstikentillä multiselectValue->value on muotoa koodiarvo-kuvausnumero.
           * Muutokselle halutaan tallentaa pelkkä koodiarvo, joten otetaan se talteen */
          codeValue = includes("-", prop("value", multiselectValue))
            ? head(split("-", prop("value", multiselectValue)))
            : prop("value", multiselectValue);
        } else {
          codeValue = koodiarvo;
        }
      }

      const changeObjects = [
        isMaarays ? [
          nth(index, asetuksetFromMaarays),
          nth(index + 1, asetuksetFromMaarays)
        ] : null,
        asetusChangeObj,
        nth(index + 1, asetukset),
        valueValueOfAsetusChangeObj && includes("kujalisamaareetlisaksiajalla", valueValueOfAsetusChangeObj)
          ? [
              find(
                compose(endsWith(".alkamispaiva"), prop("anchor")),
                asetukset
              ) || null,
              find(
                compose(endsWith(".paattymispaiva"), prop("anchor")),
                asetukset
              ) || null
            ]
          : null
      ];

      const alimaarays = reject(isNil, {
        generatedId: `alimaarays-${Math.random()}`,
        parent: isMaarays
          ? index !== 0
            ? alimaarayksenParent
            : null
          : alimaarayksenParent,
        parentMaaraysUuid: isMaarays
          ? index === 0
            ? alimaarayksenParent
            : null
          : null,
        kohde: find(propEq("tunniste", tunniste), kohteet),
        koodiarvo:
          koodisto === "kielikoodistoopetushallinto"
            ? toLower(codeValue)
            : codeValue,
        koodisto,
        tila: "LISAYS",
        arvo,
        maaraystyyppi: find(propEq("tunniste", "RAJOITE"), maaraystyypit),
        meta: {
          ...(alkupvm
            ? { alkupvm: moment(alkupvm).format("YYYY-MM-DD") }
            : null),
          ...(loppupvm
            ? { loppupvm: moment(loppupvm).format("YYYY-MM-DD") }
            : null),
          ...(prop("isValtakunnallinenKehittamistehtava", paalomakkeenBEMuutos)
            ? { valtakunnallinenKehittamistehtava: true }
            : null),
          ...(multiSelectUuid ? { multiselectUuid: multiSelectUuid } : null),
          changeObjects: changeObjects.filter(Boolean),
          kuvaus: prop("label", multiselectValue),
          rajoiteId
        },
        orgOid:
          koodisto === "oppilaitos"
            ? prop("value", multiselectValue)
            : undefined
      });

      const updatedMuutosobjektit = append(alimaarays, muutosobjektit);
      const nextAsetusChangeObj = nth(index + offset, asetukset);

      let end =
        nextKohdennuksenKohdennusIndex >= 0
          ? nextKohdennuksenKohdennusIndex
          : asetukset.length - offset;
      end =
        insideMulti && isAsetusKohdennuksenKohdennus(nextAsetusChangeObj)
          ? end - 1
          : end;
      let start = index + offset;
      if (start <= end) {
        return createAlimaarayksetBEObjects(
          kohteet,
          maaraystyypit,
          paalomakkeenBEMuutos,
          isMaarays ? asetuksetFromMaarays : asetukset,
          updatedMuutosobjektit,
          start,
          kohdennuksenKohdeNumber,
          insideMulti || multiIndex > 0
        );
      }
      return updatedMuutosobjektit;
    }),
    flatten,
    uniqBy(prop("generatedId"))
  )(multiSelectValues);

  return result;
};

export const createBeObjsForRajoitepoistot = (
  rajoitepoistot,
  maaraykset,
  kohteet,
  maaraystyypit
) => {
  /** Haetaan opiskelijamäärärajoitteet erikseen, koska niiltä pitää poistaa parent määräys */
  const opiskelijamaararajoitteet = filter(
    maarays =>
      maarays.koodisto === "kujalisamaareet" &&
      path(["maaraystyyppi", "tunniste"], maarays) === "RAJOITE",
    maaraykset || []
  );

  /** Haetaan loput rajoitemääräykset */
  const muutRajoitemaaraykset = filter(
    maarays =>
      length(prop("aliMaaraykset", maarays) || []) &&
      maarays.koodisto !== "kujalisamaareet",
    maaraykset || []
  );

  /** Luodaan poisto muutos-objektit opiskelijamäärärajoitteille */
  const poistoCobjsOpiskelijamaararajoitteet = map(
    maarays =>
      createRajoitepoistoBEObjs(
        [maarays],
        rajoitepoistot,
        kohteet,
        maaraystyypit
      ),
    opiskelijamaararajoitteet
  ).filter(Boolean);

  /** Luodaan poisto muutos-objektit muille rajoitteille */
  const poistoCobjsMuutrajoitteet = map(
    maarays =>
      createRajoitepoistoBEObjs(
        maarays.aliMaaraykset,
        rajoitepoistot,
        kohteet,
        maaraystyypit
      ),
    muutRajoitemaaraykset
  ).filter(Boolean);

  return filter(
    arr => length(arr),
    concat(poistoCobjsMuutrajoitteet, poistoCobjsOpiskelijamaararajoitteet)
  );
};

export const createRajoitepoistoBEObjs = (
  alimaaraykset,
  rajoitepoistot,
  kohteet,
  maaraystyypit
) => {
  return length(alimaaraykset)
    ? map(alimaarays => {
        if (
          find(
            poisto =>
              pathEq(
                ["properties", "rajoiteId"],
                path(["meta", "rajoiteId"], alimaarays),
                poisto
              ),
            rajoitepoistot
          )
        ) {
          return {
            kohde: find(
              propEq("tunniste", path(["kohde", "tunniste"], alimaarays)),
              kohteet
            ),
            koodiarvo: alimaarays.koodiarvo,
            koodisto: alimaarays.koodisto,
            maaraystyyppi: find(propEq("tunniste", "RAJOITE"), maaraystyypit),
            tila: "POISTO",
            maaraysUuid: alimaarays.uuid,
            meta: {
              changeObjects: [
                {
                  anchor: `rajoitepoistot.${alimaarays.uuid}`,
                  properties: {
                    rajoiteId: path(["meta", "rajoiteId"], alimaarays)
                  }
                }
              ]
            }
          };
        }
        return null;
      }, alimaaraykset).filter(Boolean)
    : null;
};
