import {
  find,
  map,
  propEq,
  filter,
  compose,
  flatten,
  values,
  not,
  pathEq,
  assocPath,
  append,
  path,
  head,
  uniq,
  reject,
  isNil,
  includes,
  concat
} from "ramda";
import { getMaarayksetByTunniste } from "../lupa";
import { getMaakuntakunnat } from "../maakunnat";

/**
 * Palauttaa taulukollisen backend-muotoisia muutosobjekteja.
 * @param {object} changeObjects
 * @param {object} kohde
 * @param {array} maaraystyypit
 * @param {array} lupaMaaraykset
 */
export async function defineBackendChangeObjects(
  changeObjects = {},
  kohde,
  maaraystyypit,
  lupaMaaraykset
) {
  const {
    quickFilterChanges = [],
    changesByProvince,
    perustelut
  } = changeObjects;

  const maaraystyyppi = find(propEq("tunniste", "VELVOITE"), maaraystyypit);

  /**
   * Noudetaan toiminta-alueeseen liittyvät määräykset. Määräysten uuid-arvoja
   * tarvitaan lupaan kuuluvien alueiden poistamisen yhteydessä.
   */
  const maaraykset = await getMaarayksetByTunniste("toimintaalue", lupaMaaraykset);
  const maakuntakunnat = await getMaakuntakunnat();

  /**
   * PIKAVALINTOJEN LÄPIKÄYNTI
   *
   * Käydään läpi pikavalinnat eli nuts1-koodiston koodiarvoja FI1 ja FI2
   * vastaavat muutosobjektit muodostaen niistä backend-muotoiset muutos-
   * objektit.
   */
  let quickFilterBEchangeObjects =
    map(changeObj => {
      /**
       * Jos kaikki maakunnat ja kunnat on valittuna, on backendille lähetettävä
       * muutosobjekti nuts1-koodiston arvolla FI1. Mikäli yksikään maakunnista
       * ei ole valittuna eli toiminta-aluetta ei ole määritelty, on backendille
       * lähetettävä muutosobjekti nuts1-koodiston arvolla FI2.
       */
      const { isChecked } = changeObj.properties;
      const { koodiarvo } = changeObj.properties.metadata;

      let muutos = {
        tila: isChecked ? "LISAYS" : "POISTO",
        meta: {
          changeObjects: perustelut,
          perusteluteksti: [
            {
              value:
                perustelut && perustelut.length > 0
                  ? perustelut[0].properties.value
                  : ""
            }
          ]
        },
        kohde,
        maaraystyyppi,
        koodisto: "nuts1",
        koodiarvo
      };

      if (!isChecked) {
        /**
         * Mikäli kyseessä on poisto, lisätään muutosobjektiin määräyksen uuid.
         */
        const maarays = find(propEq("koodiarvo", koodiarvo), maaraykset);
        // Varmistetaan vielä, että määräys on olemassa.
        if (maarays) {
          muutos.maaraysUuid = maarays.uuid;
        } else {
          console.warn("Unable to find maaraysUuid for ", koodiarvo);
        }
      }

      return muutos;
    }, quickFilterChanges) || [];

  /**
   * YKSITTÄISTEN MAAKUNTIEN JA KUNTIEN LÄPIKÄYNTI
   *
   * Käyttäjä on voinut tehdä monenlaisia muutoksia toiminta-alueeseen. Käydään
   * läpi pikavalintojen - eli nuts1-koodiston - ulkopuolelle jäävät muutokset.
   */
  const muutosFI1 = find(
    propEq("koodiarvo", "FI1"),
    quickFilterBEchangeObjects
  );

  const provinceChangeObjects = flatten(values(changesByProvince));

  const provinceBEchangeObjects = {};

  /**
   * Etsitään ne maakunnat, joihin on kohdistunut muutos.
   */
  const provinces = filter(maakunta => {
    return !!find(
      pathEq(["properties", "metadata", "koodiarvo"], maakunta.koodiarvo),
      provinceChangeObjects
    );
  }, maakuntakunnat);

  // YKSITTÄISTEN MAAKUNTIEN JA KUNTIEN POISTAMINEN
  const yksittaisetMaaraykset = filter(
    compose(not, propEq("koodisto", "nuts1")),
    maaraykset
  );

  provinceBEchangeObjects.poistot = map(maarays => {
    // Selvitetään, ollaanko alue aikeissa poistaa luvan piiristä.
    const isMaakunta = maarays.koodiarvo.length === 2;
    const maakunta = !isMaakunta
      ? head(
          filter(province => {
            return find(
              propEq("koodiarvo", maarays.koodiarvo),
              province.kunnat
            );
          }, provinces)
        )
      : null;
    const changeObj = find(
      pathEq(["properties", "metadata", "koodiarvo"], maarays.koodiarvo),
      provinceChangeObjects
    );
    const provinceChangeObj = maakunta
      ? find(
          pathEq(["properties", "metadata", "koodiarvo"], maakunta.koodiarvo),
          provinceChangeObjects
        )
      : null;
    const isProvinceGoingToBeFullyActive = provinceChangeObj
      ? provinceChangeObj.properties.isChecked &&
        !provinceChangeObj.properties.isIndeterminate
      : false;

    const isGoingToBeRemoved =
      isProvinceGoingToBeFullyActive ||
      (changeObj &&
        ((isMaakunta &&
          (changeObj.properties.isIndeterminate ||
            !changeObj.properties.isChecked)) ||
          (!isMaakunta && !changeObj.properties.isChecked))) ||
      (muutosFI1 && muutosFI1.tila === "LISAYS");

    if (isGoingToBeRemoved) {
      // Alue täytyy poistaa. Luodaan backend-muotoinen muutosobjekti.
      return {
        tila: "POISTO",
        meta: {
          changeObjects: perustelut,
          perusteluteksti: [
            {
              value:
                perustelut && perustelut.length > 0
                  ? perustelut[0].properties.value
                  : ""
            }
          ]
        },
        kohde,
        koodisto: maarays.koodisto,
        koodiarvo: maarays.koodiarvo,
        maaraystyyppi,
        maaraysUuid: maarays.uuid
      };
    }
    return null;
  }, yksittaisetMaaraykset).filter(Boolean);

  /**
   * YKSITTÄISTEN MAAKUNTIEN JA KUNTIEN LISÄÄMINEN
   *
   * Yksittäiset maakunnat lisätään vain siinä tapauksessa, jos nust1-koodiston
   * koodiarvon FI1-mukaista muutosobjektia ei olla lisäämässä tai poistamassa. FI1 kattaa
   * koko maan kaikki maakunnat - pois lukien Ahvenanmaan maakunta - ja niinpä
   * kyseisen koodiarvon mukaisen muutosobjektin ollessa backendille
   * lähetettävien muutosobjektien joukossa eivät yksittäiset maakunta- ja
   * kuntalisäykset ole tarpeellisia.
   **/

  // Jos nuts-1 koodiston koodiarvon FI1-mukainen muutosobjekti ollaan poistamassa
  // luodaan lisäysobjektit kaikista maakunnista ja kunnista joita ei ole poistettu
  if (muutosFI1 && muutosFI1.tila === "POISTO") {
    const filteredMaakuntaKunnat = filter(m => m.koodiarvo !== "99" && m.koodiarvo !== "21", maakuntakunnat);
    // MAAKUNTIEN LISÄYSOBJEKTIEN LUOMINEN
   const addedProvinceChangeObjects = reject(isNil)(map(maakunta => {
      return includes(maakunta.koodiarvo, map(province => province.koodiarvo, provinces)) ? null :
        {
          tila: "LISAYS",
          kohde,
          koodisto: "maakunta",
          koodiarvo: maakunta.koodiarvo,
          maaraystyyppi
        }
    },
      filteredMaakuntaKunnat));

    // KUNTIEN LISÄYSOBJEKTIEN LUOMINEN
    const provincesNotAdded = filter(maakuntakunta =>
      !includes(maakuntakunta.koodiarvo, map(province => province.koodiarvo, addedProvinceChangeObjects)), filteredMaakuntaKunnat);

    const addedMunicipalityChangeObjects = flatten(map(province => {
      return reject(isNil)(map(kunta => {
        return includes(kunta.koodiarvo, map(co => path(['properties', 'metadata', 'koodiarvo'], co), provinceChangeObjects)) ?
          null : {
            tila: "LISAYS",
            kohde,
            koodisto: "kunta",
            koodiarvo: kunta.koodiarvo,
            maaraystyyppi
          };
      }, province.kunnat))
    }, provincesNotAdded));
    provinceBEchangeObjects.lisaykset =
      append(concat(addedProvinceChangeObjects, addedMunicipalityChangeObjects), provinceBEchangeObjects.lisaykset);
  }

  else if (!muutosFI1 || (muutosFI1 && muutosFI1.tila !== "LISAYS")) {
    /**
     * Käydään muutoksia sisältävät maakunnat ja niiden kunnat läpi
     * tarkoituksena löytää kunnat, jotka on lisättävä lupaan.
     */
    provinceBEchangeObjects.lisaykset = flatten(
      uniq(
        map(changeObj => {
          const isMaakunta =
            changeObj.properties.metadata.koodiarvo.length === 2;
          const maakunta = !isMaakunta
            ? head(
                filter(province => {
                  return find(
                    propEq(
                      "koodiarvo",
                      changeObj.properties.metadata.koodiarvo
                    ),
                    province.kunnat
                  );
                }, maakuntakunnat)
              )
            : find(
                propEq("koodiarvo", changeObj.properties.metadata.koodiarvo),
                maakuntakunnat
              );
          const maakuntaMaarays = maakunta
            ? find(
                maarays =>
                  maarays.koodisto === "maakunta" &&
                  maarays.koodiarvo === maakunta.koodiarvo,
                maaraykset
              )
            : null;

          const maakuntaChangeObj = find(
            pathEq(["properties", "metadata", "koodiarvo"], maakunta.koodiarvo),
            provinceChangeObjects
          );
          let muutosobjektit = [];

          if (maakuntaChangeObj && maakuntaChangeObj.properties.isChecked) {
            if (!maakuntaChangeObj.properties.isIndeterminate) {
              /**
               * Jos Maakunnan kaikkia kuntia ollaan lisäämässä lupaan, muodostetaan
               * vain yksi backend-muotoinen muutosobjekti. Se kertoo, että koko
               * maakunta ollaan lisäämässä luvan piiriin.
               */
              muutosobjektit = append(
                {
                  tila: "LISAYS",
                  meta: {
                    changeObjects: perustelut,
                    perusteluteksti: [
                      {
                        value:
                          perustelut && perustelut.length > 0
                            ? perustelut[0].properties.value
                            : ""
                      }
                    ]
                  },
                  kohde,
                  koodisto: "maakunta",
                  koodiarvo: maakunta.koodiarvo,
                  maaraystyyppi
                },
                muutosobjektit
              );
            } else {
              /**
               * Jos maakunnan kunnista vain osaa ollaan lisäämässä lupaan,
               * käydään kunnat läpi ja muodostetaan lisättävistä backend-
               * muotoiset muutosobjektit.
               */
              muutosobjektit = map(kunta => {
                const kuntaChangeObj = find(
                  pathEq(
                    ["properties", "metadata", "koodiarvo"],
                    kunta.koodiarvo
                  ),
                  provinceChangeObjects
                );
                const kuntaMaarays = find(
                  maarays =>
                    maarays.koodisto === "kunta" &&
                    maarays.koodiarvo === kunta.koodiarvo,
                  maaraykset
                );

                if (
                  !kuntaMaarays &&
                  ((kuntaChangeObj && kuntaChangeObj.properties.isChecked) ||
                    (!!maakuntaMaarays && !kuntaChangeObj))
                ) {
                  return {
                    tila: "LISAYS",
                    meta: {
                      changeObjects: perustelut,
                      perusteluteksti: [
                        {
                          value:
                            perustelut && perustelut.length > 0
                              ? perustelut[0].properties.value
                              : ""
                        }
                      ]
                    },
                    kohde,
                    koodisto: "kunta",
                    koodiarvo: kunta.koodiarvo,
                    maaraystyyppi
                  };
                }
                return null;
              }, maakunta.kunnat).filter(Boolean);
            }
          } else if (!isMaakunta && changeObj.properties.isChecked) {
            /**
             * Muodostetaan muutosobjektit tilanteessa, jossa maakuntavalintaan
             * ei ole kohdistunut muutosta.
             */
            muutosobjektit = [
              {
                tila: "LISAYS",
                meta: {
                  changeObjects: perustelut,
                  perusteluteksti: [
                    {
                      value:
                        perustelut && perustelut.length > 0
                          ? perustelut[0].properties.value
                          : ""
                    }
                  ]
                },
                kohde,
                koodisto: "kunta",
                koodiarvo: changeObj.properties.metadata.koodiarvo,
                maaraystyyppi
              }
            ];
          }
          return muutosobjektit;
        }, provinceChangeObjects)
      )
    ).filter(Boolean);
  }

  let allBEobjects = flatten([
    [quickFilterBEchangeObjects],
    [provinceBEchangeObjects.lisaykset] || [],
    [provinceBEchangeObjects.poistot]
  ]).filter(Boolean);

  /**
   * Lisätään vielä frontin muutokset ensimmäiselle backend-muutosobjektille,
   * jos muutosobjekteja on olemassa vähintään yksi kappale.
   **/
  if (allBEobjects.length > 0) {
    allBEobjects = assocPath(
      [0, "meta", "changeObjects"],
      append(
        {
          anchor: "categoryFilter",
          properties: {
            quickFilterChanges,
            changesByProvince
          }
        },
        path([0, "meta", "changeObjects"], allBEobjects)
      ),
      allBEobjects
    );
  }

  return allBEobjects;
}
