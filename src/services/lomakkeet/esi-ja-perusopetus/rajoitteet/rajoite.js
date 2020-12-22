import {
  append,
  assocPath,
  compose,
  drop,
  filter,
  head,
  includes,
  isEmpty,
  length,
  map,
  nth,
  path,
  prop,
  split,
  startsWith
} from "ramda";

import { getKokonaisopiskelijamaaralomake } from "./rajoitukset/6-opiskelijamaarat";
import { getAsetuksenKohdekomponentti } from "./rajoitukset/asetuksenKohdekomponentit";
import { getKohdistuksenKohdekomponentti } from "./rajoitukset/kohdistuksenKohdekomponentit";
import { getKohteenTarkenninkomponentit } from "./kohteenTarkenninkomponentit";
import { getAsetuksenTarkenninkomponentit } from "./rajoitukset/asetuksenTarkenninkomponentit";
import { getKohdistuksenTarkenninkomponentit } from "./rajoitukset/kohdistuksenTarkenninkomponentit";
import { getAnchorPart } from "utils/common";

const kohdevaihtoehdot = [
  {
    label: "Opetus, jota lupa koskee",
    value: "opetustehtavat"
  },
  {
    label: "Opiskelijamäärät",
    value: "opiskelijamaarat"
  }
];

const asetuslomakkeet = {
  opiskelijamaarastrategia: getKokonaisopiskelijamaaralomake
};

/**
 * Rajoitekriteereiden näyttäminen
 * @param {*} asetus
 * @param {*} locale
 * @param {*} changeObjects
 * @param {*} onRemoveCriterion
 */
async function getYksittainenAsetuslomake(
  osioidenData,
  asetus,
  locale,
  onRemoveCriterion,
  asetusvaihtoehdot
) {
  /**
   * Ensimmäistä asetusta ei voi käyttäliittymässä poistaa. Kun uutta
   * rajoitetta luodaan, näytetään käyttäjälle 1. asetuksen kohdekenttä, joka
   * on pudotusvalikko. Kun käyttäjä on valinnut kohteen, hänelle näytetään
   * ensimmäisen asetuksen rajoituskenttä. Rajoituskentän tyyppi ja sisältö
   * määrittyvät sen mukaan, mikä on tai mitkä ovat:
   *
   * 1. Asetuksen kohde.
   * 2. Käyttäjän lomakkeella tekemät muutokset.
   * 3. Lupaan kuuluvat määritykset (toteutetaan myöhemmin).
   *
   * Määritetään asetuksen rajoitusosaa vastaava lomakerakenne, mikäli
   * kohde on tiedossa.
   */
  if (asetus.kohde) {
    /**
     * Käydään noutamassa lomakerakenne rajoitusavaimen avulla. Rajoitusavain
     * voi olla esim. maaraaika tai opetustaAntavatKunnat.
     */
    const rajoitusavain = path(
      ["kohde", "A", "properties", "value", "value"],
      asetus
    );

    console.info(asetus.id, rajoitusavain);
    /**
     * Mikäli itse rajoitusta on muokattu, on siitä olemassa muutosobjekti.
     */
    const rajoitus = rajoitusavain
      ? await asetuslomakkeet[asetus.id](osioidenData[rajoitusavain], locale)
      : null;

    return {
      anchor: asetus.id,
      categories: [
        {
          anchor: "kohde",
          layout: { indentation: "none" },
          components: [
            {
              anchor: "A",
              name: "Autocomplete",
              styleClasses: ["mb-6 w-4/5 xl:w-2/3"],
              properties: {
                isMulti: false,
                options: asetusvaihtoehdot,
                title: "Rajoitekriteeri"
              }
            }
          ]
        },
        // Lisätään lomakerakenteeseen rajoituskenttä, jonka sisältö määrittyy sitä edeltävän kohdekentän perusteella
        rajoitusavain && asetus.rajoitus ? rajoitus : null
      ].filter(Boolean),
      isRemovable: asetus.id !== "0",
      onRemove: category => {
        onRemoveCriterion(asetus.id);
      },
      title: `Rajoitekriteeri ${asetus.id}`
    };
  }
  return null;
}

async function getAsetuslomakekokonaisuus(
  rajoiteId,
  rajoiteChangeObjects,
  asetuksenKohdeavain,
  osioidenData,
  locale,
  onRemoveCriterion,
  index = 0,
  lomakerakenne = []
) {
  const asetuksenKohdekomponentti = getAsetuksenKohdekomponentti(
    asetuksenKohdeavain
  );

  console.info(asetuksenKohdekomponentti, rajoiteChangeObjects);

  const asetuksenTarkenninlomakkeenAvain = path(
    ["asetukset", index, "kohde", "properties", "value", "value"],
    rajoiteChangeObjects
  );

  const asetuksenTarkenninkomponentit = asetuksenTarkenninlomakkeenAvain
    ? getAsetuksenTarkenninkomponentit(asetuksenTarkenninlomakkeenAvain, locale)
    : [];

  console.group();
  console.info("Asetuksen kohdeavain", asetuksenKohdeavain);
  console.info("Asetuksen kohdekomponentti", asetuksenKohdekomponentti);
  console.info("Asetuksen tarkentimen avain", asetuksenTarkenninlomakkeenAvain);
  console.info("Asetuksen tarkenninlomake", asetuksenTarkenninkomponentit);
  console.groupEnd();

  const updatedLomakerakenne = append(
    {
      anchor: index,
      title: `${index + 1})`,
      layout: { indentation: "none" },
      components: asetuksenKohdekomponentti ? [asetuksenKohdekomponentti] : [],
      categories: [
        {
          anchor: `asetuksenTarkennin-${index}`,
          components: asetuksenTarkenninkomponentit
        }
      ]
    },
    lomakerakenne
  );

  // const asetuksetLength = Object.keys(
  //   prop("asetukset", rajoiteChangeObjects) || {}
  // ).length;

  // console.info(index, asetuksetLength);

  // if (index < asetuksetLength - 1) {
  //   // const asetuksenKohdeavain = prop("asetukset", rajoiteChangeObjects)
  //   //   ? path(
  //   //       ["asetukset", `${index}`, "kohde", "properties", "value", "value"],
  //   //       rajoiteChangeObjects
  //   //     )
  //   //   : kohdeavain;

  //   return getAsetuslomakekokonaisuus(
  //     rajoiteId,
  //     rajoiteChangeObjects,
  //     asetuksenKohdeavain,
  //     osioidenData,
  //     locale,
  //     onRemoveCriterion,
  //     index + 1,
  //     updatedLomakerakenne
  //   );
  // }

  // console.info(updatedLomakerakenne);

  return updatedLomakerakenne;
}

// async function getKohdennuslomakekokonaisuus(
//   rajoiteId,
//   kohdeavain,
//   kohteenTarkenninavain,
//   groupedChangeObjects,
//   osioidenData,
//   locale,
//   onRemoveCriterion,
//   index = 0,
//   lomakerakenne = []
// ) {
//   const asetuksenKohdeavain = path(
//     [
//       rajoiteId,
//       "kohdennukset",
//       `${index}`,
//       "kohde",
//       "properties",
//       "value",
//       "value"
//     ],
//     groupedChangeObjects
//   );
//   const asetuksenKohdekomponentti = getKohdistuksenKohdekomponentti(
//     kohteenTarkenninavain,
//     kohdeavain
//   );

//   const asetuksenTarkenninlomakkeenAvain =
//     asetuksenKohdeavain ||
//     path(["properties", "value", "value"], asetuksenKohdekomponentti);

//   console.info("Kohdennuksen kohdekomponentti: ", asetuksenKohdekomponentti);

//   const asetuksenTarkenninlomake = asetuksenTarkenninlomakkeenAvain
//     ? getAsetuksenTarkenninkomponentit(asetuksenTarkenninlomakkeenAvain, locale)
//     : [];

//   console.info(
//     `Kohdennus ${index}`,
//     asetuksenKohdekomponentti,
//     asetuksenKohdeavain,
//     asetuksenTarkenninlomake
//   );

//   const updatedLomakerakenne = append(
//     {
//       anchor: index,
//       title: `${index + 1})`,
//       layout: { indentation: "none" },
//       components: asetuksenKohdekomponentti ? [asetuksenKohdekomponentti] : [],
//       categories: asetuksenTarkenninlomake
//     },
//     lomakerakenne
//   );

//   const asetuksetLength = Object.keys(
//     path([rajoiteId, "kohdennukset"], groupedChangeObjects) || {}
//   ).length;

//   console.info(index, asetuksetLength);

//   // if (index < asetuksetLength - 1) {
//   //   return getAsetuslomakekokonaisuus(
//   //     rajoiteId,
//   //     kohdeavain,
//   //     kohteenTarkenninavain,
//   //     groupedChangeObjects,
//   //     osioidenData,
//   //     locale,
//   //     onRemoveCriterion,
//   //     index + 1,
//   //     updatedLomakerakenne
//   //   );
//   // }

//   return updatedLomakerakenne;
// }

const getKohdennuksetRecursively = async (
  kohdistuksenKohdeavain,
  data,
  { isReadOnly },
  locale,
  changeObjects,
  { lisaaKohdennus, onAddCriterion, onRemoveCriterion },
  kohdennuksetChangeObjects,
  lomakerakenne = [],
  index = 0,
  ensimmaisenKohdennuksenKohteenTarkenninavain
) => {
  const { lomakedata, osioidenData, rajoiteId } = data;

  // const asetuksetChangeObjects = filter(
  //   cObj =>
  //     startsWith(`rajoitelomake.${rajoiteId}.asetukset`, cObj.anchor) &&
  //     !startsWith(`rajoitelomake.${rajoiteId}.asetukset.kohde`, cObj.anchor) &&
  //     !includes("rajoitus", cObj.anchor),
  //   changeObjects
  // );

  const kohdistuksenKohdekomponentti = kohdistuksenKohdeavain
    ? getKohdistuksenKohdekomponentti(kohdistuksenKohdeavain)
    : null;

  // const kohdistuksenTarkenninavain = path(
  //   [
  //     rajoiteId,
  //     "kohdennukset",
  //     index,
  //     "tarkennin",
  //     "rajoite",
  //     "kohde",
  //     "tarkennin",
  //     kohteenTarkenninavain,
  //     "properties",
  //     "value",
  //     "value"
  //   ],
  //   groupedChangeObjects
  // );

  const kohdennuksenTarkenninKomponentit = kohdistuksenKohdekomponentti
    ? getKohdistuksenTarkenninkomponentit("joistaEnintaan", locale)
    : [];

  /**
   * Käydään noutamassa lomakerakenne rajoitusavaimen avulla. Rajoitusavain
   * voi olla esim. maaraaika tai opetustaAntavatKunnat.
   */
  const rajoiteChangeObjects = path(
    [index, "tarkennin", "rajoite"],
    kohdennuksetChangeObjects
  );

  const kohteenTarkenninavain = path(
    ["kohde", "valikko", "properties", "value", "value"],
    rajoiteChangeObjects
  );

  const kohteenTarkenninkomponentit = await getKohteenTarkenninkomponentit(
    osioidenData,
    kohteenTarkenninavain,
    locale
  );

  const ensimmaisenAsetuksenKohdeavain = path(
    [
      "kohde",
      "tarkennin",
      kohteenTarkenninavain,
      "properties",
      "value",
      "value"
    ],
    rajoiteChangeObjects
  );

  const alikohdennuksetChangeObjects = path(
    [index, "kohdennukset"],
    kohdennuksetChangeObjects
  );

  console.group();
  console.info("Index", index);
  console.info("Kohdistuksen kohdeavain", kohdistuksenKohdeavain);
  console.info("Kohdistuksen kohdekomponentti", kohdistuksenKohdekomponentti);
  console.info(
    "Kohdistuksen tarkenninkomponentit",
    kohdennuksenTarkenninKomponentit
  );
  console.info("Kohteen tarkentimen avain", kohteenTarkenninavain);
  console.info("Kohdevaihtoehdot", kohdevaihtoehdot);
  console.info("Kohteen tarkenninkomponentit", kohteenTarkenninkomponentit);
  console.info("RajoiteChangeObjects", rajoiteChangeObjects);
  console.info("1. asetuksen kohdeavain", ensimmaisenAsetuksenKohdeavain);
  console.info("kohdennuksetChangeObjects", kohdennuksetChangeObjects);
  console.info(
    "1. kohdistuksen kohteen tarkenninavain",
    ensimmaisenKohdennuksenKohteenTarkenninavain
  );
  console.info("alikohdennuksetChangeObjects", alikohdennuksetChangeObjects);
  console.groupEnd();

  const paivitettyLomakerakenne = append(
    {
      anchor: "kohdennukset",
      title: "Kohdennukset",
      styleClasses: ["bg-gray-100 border-t border-b border-gray-300"],
      components: [],
      categories: [
        {
          // index on kohdennuksen juokseva järjestysnumero
          anchor: index,
          styleClasses: ["border border-gray-300"],
          title: `Kohdennus ${index}`,
          components: kohdistuksenKohdekomponentti
            ? [kohdistuksenKohdekomponentti]
            : [],
          categories: [
            {
              anchor: "tarkennin",
              layout: { indentation: "none" },
              components: kohdennuksenTarkenninKomponentit,
              categories: [
                {
                  anchor: "rajoite",
                  styleClasses: [
                    "bg-green-100 border-t border-b border-gray-300"
                  ],
                  categories: [
                    {
                      anchor: "kohde",
                      title: "Rajoituksen kohde",
                      components: [
                        {
                          anchor: "valikko",
                          name: "Autocomplete",
                          styleClasses: ["w-4/5 xl:w-2/3 mb-6"],
                          properties: {
                            isMulti: false,
                            options: kohdevaihtoehdot
                          }
                        }
                      ],
                      categories:
                        length(kohteenTarkenninkomponentit) > 0
                          ? [
                              {
                                anchor: "tarkennin",
                                layout: { indentation: "none" },
                                components: kohteenTarkenninkomponentit
                              }
                            ]
                          : []
                    },
                    ensimmaisenAsetuksenKohdeavain
                      ? {
                          anchor: "asetukset",
                          title: "Rajoitekriteerit",
                          categories: await getAsetuslomakekokonaisuus(
                            rajoiteId,
                            rajoiteChangeObjects,
                            ensimmaisenAsetuksenKohdeavain,
                            osioidenData,
                            locale,
                            onRemoveCriterion
                          )
                        }
                      : null
                  ].filter(Boolean)
                },
                alikohdennuksetChangeObjects
                  ? {
                      anchor: "alikohdennukset",
                      categories: await getKohdennuksetRecursively(
                        null,
                        data,
                        { isReadOnly },
                        locale,
                        changeObjects,
                        { lisaaKohdennus, onAddCriterion, onRemoveCriterion },
                        alikohdennuksetChangeObjects
                      )
                    }
                  : null,
                {
                  anchor: "kohdennuksenLisaaminen",
                  styleClasses: ["flex justify-end my-6 pr-8"],
                  components: [
                    {
                      anchor: "painike",
                      name: "SimpleButton",
                      onClick: payload => {
                        console.info(payload.fullAnchor);
                        const kohdennusId = getAnchorPart(
                          payload.fullAnchor,
                          3
                        );
                        return lisaaKohdennus({
                          ...payload,
                          metadata: {
                            ...payload.metadata,
                            rajoiteId: data.rajoiteId,
                            kohdennusId
                          }
                        });
                      },
                      properties: {
                        isVisible: true,
                        text: "Lisää kohdennus"
                      }
                    }
                  ]
                }
              ].filter(Boolean)
            }
          ]
        }
      ]
    },
    lomakerakenne
  );

  // Jos kohdennuksia on luotu lisää, otetaan nekin mukaan lopulliseeen
  // palautettavaan lomakerakenteeseen.
  if (prop(index + 1, kohdennuksetChangeObjects)) {
    const kohdistuksenKohdeavain = path(
      [
        0,
        "tarkennin",
        "rajoite",
        "kohde",
        "tarkennin",
        ensimmaisenKohdennuksenKohteenTarkenninavain || kohteenTarkenninavain,
        "properties",
        "value",
        "value"
      ],
      kohdennuksetChangeObjects
    );
    return getKohdennuksetRecursively(
      kohdistuksenKohdeavain,
      data,
      { isReadOnly },
      locale,
      changeObjects,
      { lisaaKohdennus, onAddCriterion, onRemoveCriterion },
      kohdennuksetChangeObjects,
      paivitettyLomakerakenne,
      index + 1,
      ensimmaisenKohdennuksenKohteenTarkenninavain || kohteenTarkenninavain
    );
  }

  console.info(paivitettyLomakerakenne);

  return paivitettyLomakerakenne;
};

/**
 * Lomake, joka funktion palauttaman rakenteen myötä muodostetaan, mahdollistaa
 * sen, että käyttäjä voi luoda asetuksia, jotka yhdessä muodostavat rajoitteen.
 * Jotta rajoitetta voidaan hyödyntää, tulee sen sisältää vähintään kaksi
 * asetusta.
 *
 * Esimerkkejä yksittäisestä asetuksesta:
 *
 * Esimerkki 1:

 * Kohde: Kunnat, joissa opetusta järjestetään
 * Rajoitus: Kuopio, Pielavesi, Siilinjärvi
 *
 * Esimerkki 2:
 *
 * Kohde: Määräaika
 * Rajoitus: 20.9.2021 - 14.3.2022
 *
 * @param {*} data
 * @param {*} isReadOnly
 * @param {*} locale
 * @param {*} changeObjects
 */
export async function rajoitelomake(
  data,
  booleans,
  locale,
  changeObjects,
  functions
) {
  function groupChangeObjects(changeObjects, index = 0, result = {}) {
    const changeObj = head(changeObjects);
    if (changeObj) {
      const fn = compose(
        assocPath,
        drop(1),
        split("."),
        prop("anchor")
      )(changeObj);
      const updatedResult = fn(changeObj, result);
      return groupChangeObjects(
        drop(1, changeObjects),
        index + 1,
        updatedResult
      );
    }
    return result;
  }

  const groupedChangeObjects = groupChangeObjects(changeObjects);

  const kohdennuksetChangeObjects = path(
    [data.rajoiteId, "kohdennukset"],
    groupedChangeObjects
  );

  console.info(
    groupedChangeObjects,
    kohdennuksetChangeObjects,
    groupedChangeObjects
  );

  /**
   * Palautettava lomakemerkkaus
   */
  let lomakerakenne = [
    {
      anchor: data.rajoiteId,
      categories: await getKohdennuksetRecursively(
        null,
        data,
        booleans,
        locale,
        changeObjects,
        functions,
        kohdennuksetChangeObjects
      )
    }
  ];

  return lomakerakenne;
}
