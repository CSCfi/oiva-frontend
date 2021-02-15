import {
  addIndex,
  append,
  assocPath,
  filter,
  find,
  flatten,
  forEach,
  head,
  includes,
  join,
  keys,
  length,
  map,
  mapObjIndexed,
  nth,
  path,
  pathEq,
  pipe,
  prop,
  sortBy,
  split,
  toLower,
  unnest,
  values
} from "ramda";
import moment from "moment";
import { __ } from "i18n-for-browser";
import React from "react";

const pisteytys = {
  rajoite: 0,
  kohde: 1,
  valikko: 2,
  tarkennin: 3,
  kohdennukset: 1000,
  asetukset: 5
};

const calculateAnchorValue = (anchorParts, index = 0, score = 0) => {
  const anchorPart = nth(index, anchorParts);
  if (anchorPart) {
    const uudetPisteet = pisteytys[anchorPart] || parseInt(anchorPart, 10);
    return calculateAnchorValue(
      anchorParts,
      index + 1,
      pisteytys[anchorPart] ? score + uudetPisteet * Math.pow(2, index) : score
    );
  }
  return score;
};

export function sortRestrictions(rajoitteetByRajoiteId) {
  return mapObjIndexed(rajoite => {
    return sortBy(
      prop("score"),
      map(changeObj => {
        const { anchor } = changeObj;
        return {
          ...changeObj,
          score: calculateAnchorValue(split(".", anchor))
        };
      }, rajoite)
    );
  }, rajoitteetByRajoiteId);
}

function getAmountOfInstances(substring, string) {
  const re = new RegExp(substring, "g");
  return (string.match(re) || []).length;
}

function addEnding(ending, string, amountOfEndings = 0, index = 0) {
  const updatedString = string + ending;
  if (index < amountOfEndings) {
    return addEnding(ending, updatedString, amountOfEndings, index + 1);
  }
  return string;
}

const kohteenTarkentimet = ["enintaan", "vahintaan"];

function getTarkentimenArvo(tarkennin) {
  let tarkentimenArvo =
    path(["properties", "value", "label"], tarkennin) ||
    path(["properties", "value"], tarkennin);
  return Array.isArray(tarkentimenArvo)
    ? pipe(
        map(arvo => arvo.label),
        join(",<br/>")
      )(tarkentimenArvo)
    : tarkentimenArvo;
}

function kayLapiKohdennus(kohdennus, locale, lista = [], format) {
  const asetukset = join(
    " ",
    flatten(
      map(asetus => {
        const tarkenninkomponentit = Object.keys(
          prop("tarkennin", asetus) || {}
        );
        return `${join(
          " ",
          map(tarkenninavain => {
            /** Skipataan päättymispäiväobjekti, ja käsitellään se yhdessä alkamispäiväobjektin kanssa **/
            if (tarkenninavain === "paattymispaiva") {
              return null;
            }
            if (tarkenninavain === "alkamispaiva") {
              const alkamispaivaValue = path(
                ["tarkennin", tarkenninavain, "properties", "value"],
                asetus
              )
                ? moment(
                    path(
                      ["tarkennin", tarkenninavain, "properties", "value"],
                      asetus
                    )
                  ).format("DD.MM.YYYY")
                : "";

              const paattymispaivaValue = path(
                ["tarkennin", "paattymispaiva", "properties", "value"],
                asetus
              )
                ? moment(
                    path(
                      ["tarkennin", "paattymispaiva", "properties", "value"],
                      asetus
                    )
                  ).format("DD.MM.YYYY")
                : "";

              return `<ul className="p-0"><li className="p-0">${__(
                "rajoitteet.ajalla"
              )} ${alkamispaivaValue} - ${paattymispaivaValue}`;
            }
            const tarkenninValue = asetus.kohde.properties.value.value;
            // TODO: Label pitäisi hakea koodistosta tarkenninValue arvon avulla jos koodistossa on muutettu tekstiä.
            const tarkenninLabel =
              tarkenninavain === "lukumaara"
                ? asetus.kohde.properties.value.label
                : "";
            const taydennyssana = includes(tarkenninValue, kohteenTarkentimet)
              ? {
                  pre: `on ${toLower(asetus.kohde.properties.value.label)}`,
                  post: "henkilöä"
                }
              : null;
            //: getTaydennyssana(tarkenninavain, locale);

            const tarkentimenArvo = getTarkentimenArvo(
              asetus.tarkennin[tarkenninavain]
            );

            const muokattuTarkentimenArvo = moment(
              tarkentimenArvo,
              "YYYY-MM-DDTHH:mm:ss.SSSZ",
              true
            ).isValid()
              ? moment(tarkentimenArvo).format("DD.MM.YYYY")
              : tarkentimenArvo;

            if (taydennyssana) {
              const item = join(
                " ",
                [
                  taydennyssana.pre,
                  `<strong>${muokattuTarkentimenArvo}</strong>`,
                  taydennyssana.post
                ].filter(Boolean)
              );
              if (format === "list") {
                return `<ul className="p-0"><li>${item}`;
              } else {
                return item;
              }
            } else if (muokattuTarkentimenArvo) {
              return format === "list"
                ? `<ul className="p-0"><li>${tarkenninLabel} <strong>${muokattuTarkentimenArvo}</strong>`
                : muokattuTarkentimenArvo;
            }
          }, tarkenninkomponentit)
        )}`;
      }, values(kohdennus.rajoite.asetukset) || [])
    )
  );

  const joista = kohdennus.kohde
    ? kohdennus.kohde.properties.value.label
    : null;
  const kohdennuslukema = kohdennus.tarkennin
    ? values(kohdennus.tarkennin)[0].properties.value
    : null;

  let paivitettyLista = lista;
  if (joista) {
    paivitettyLista = append(
      `<ul><li>${format === "list" ? toLower(joista) : `, ${toLower(joista)}`}`,
      paivitettyLista
    );
    paivitettyLista = append(
      ` <strong>${kohdennuslukema}</strong>`,
      paivitettyLista
    );
  }
  const tarkennin = path(["rajoite", "kohde", "tarkennin"], kohdennus);
  const tarkenninavain = head(keys(tarkennin || {}));
  const tarkentimenArvo = getTarkentimenArvo(prop(tarkenninavain, tarkennin));
  const taydennyssana = null;

  let item = tarkentimenArvo;

  if (taydennyssana) {
    item = join(
      " ",
      [
        taydennyssana.pre,
        `<strong>${item}</strong>`,
        taydennyssana.post
      ].filter(Boolean)
    );
  }

  paivitettyLista = append(
    format === "list" ? `<ul><li><strong>${item}</strong>` : item,
    paivitettyLista
  );

  paivitettyLista = append(asetukset, paivitettyLista);

  if (kohdennus.kohdennukset) {
    return kayLapiKohdennukset(
      kohdennus.kohdennukset,
      locale,
      paivitettyLista,
      format
    );
  }

  return paivitettyLista;
}

export function kayLapiKohdennukset(kohdennukset, locale, lista = [], format) {
  const indexedMap = addIndex(map);
  return indexedMap((kohdennus, index) => {
    return kayLapiKohdennus(kohdennus, locale, index > 0 ? [] : lista, format);
  }, kohdennukset);
}

export function getRajoiteSelkokielella(
  rajoiteId,
  rajoiteChangeObjects,
  format
) {
  let rakenne = {};

  for (
    let i = 0;
    i < rajoiteChangeObjects[rajoiteId].changeObjects.length;
    i += 1
  ) {
    rakenne = assocPath(
      split(".", rajoiteChangeObjects[rajoiteId].changeObjects[i].anchor),
      rajoiteChangeObjects[rajoiteId].changeObjects[i],
      rakenne
    );
  }

  const selkokielinenTeksti = join(
    " ",
    flatten(
      kayLapiKohdennukset(
        path(["rajoitteet", rajoiteId, "kohdennukset"], rakenne, [], format)
      )
    )
  );

  return selkokielinenTeksti;
}

export function getRajoiteListamuodossa(
  changeObjects = [],
  locale,
  rajoiteId,
  format = "list"
) {
  let listamuotoWithEndings = "";

  let rakenne = {};

  for (let i = 0; i < changeObjects.length; i += 1) {
    rakenne = assocPath(
      split(".", changeObjects[i].anchor),
      changeObjects[i],
      rakenne
    );
  }

  const baseAnchor = rajoiteId ? `rajoitteet_${rajoiteId}` : "rajoitteet";

  const kohdennukset = path([baseAnchor, "kohdennukset"], rakenne);

  if (kohdennukset) {
    const lapikaydytKohdennukset = kayLapiKohdennukset(
      kohdennukset,
      locale,
      [],
      format
    );

    const kohdennusLista = pipe(
      values,
      map(kohdennus =>
        Array.isArray(kohdennus) ? append(kohdennus, []) : values(kohdennus)
      ),
      unnest
    )(lapikaydytKohdennukset);
    const indexMap = addIndex(map);
    listamuotoWithEndings = join(
      "",
      indexMap((kohdennus, index) => {
        // Lopuksi täytyy vielä sulkea avatut listat ja niiden alkiot.
        const s = join("", kohdennus);
        const amountOfInstances = getAmountOfInstances("<ul", s);
        return addEnding(
          "</li></ul>",
          s,
          index === 0 ? amountOfInstances - 2 : amountOfInstances
        );
      }, kohdennusLista)
    );
    listamuotoWithEndings = addEnding("</li></ul>", listamuotoWithEndings, 2);
  }
  return listamuotoWithEndings;
}

export const getRajoite = (value, rajoitteet) => {
  const rajoiteId = head(
    filter(key => {
      return pathEq(
        ["changeObjects", 1, "properties", "value", "value"],
        value,
        rajoitteet[key]
      )
        ? rajoitteet[key]
        : null;
    }, keys(rajoitteet))
  );

  return { rajoiteId, rajoite: rajoitteet[rajoiteId] };
};

/**
 *  Palauttaa html merkkauksen rajoitemääräyksistä html-lupaa varten
 *
 */
export const getRajoitteetFromMaarays = (
  alimaaraykset = [],
  locale,
  naytettavaArvo
) => {
  console.info(naytettavaArvo, alimaaraykset);
  let htmlString = "";
  forEach(alimaarays => {
    htmlString = handleAlimaarays(
      alimaarays,
      htmlString,
      locale,
      naytettavaArvo
    );
  }, alimaaraykset);
  return (
    <ul
      className="htmlContent ml-8"
      dangerouslySetInnerHTML={{ __html: htmlString }}
    ></ul>
  );
};

export const handleAlimaarays = (
  alimaarays,
  htmlString,
  locale,
  naytettavaArvo = "nimi"
) => {
  let modifiedString = `${htmlString}<ul class="list-disc">`;

  const hasAlimaarays = !!length(alimaarays.aliMaaraykset);

  const isMaaraaikaRajoite =
    alimaarays.koodisto === "kujalisamaareetlisaksiajalla";

  if (isMaaraaikaRajoite) {
    const alkupvm = moment(
      path(["meta", "alkupvm"], alimaarays),
      "YYYY-MM-DD"
    ).format("DD.MM.YYYY");

    const loppupvm = moment(
      path(["meta", "loppupvm"], alimaarays),
      "YYYY-MM-DD"
    ).format("DD.MM.YYYY");

    modifiedString = `${modifiedString}<li class="list-disc">${__(
      "rajoitteet.ajalla"
    )} ${alkupvm} - ${loppupvm}</li>`;
  } else {
    let value = find(
      metadata => metadata.kieli === locale,
      path(["koodi", "metadata"], alimaarays) || []
    );
    if (value) {
      modifiedString = `${modifiedString}<li class="list-disc">${value[
        naytettavaArvo
      ] || value.nimi} ${alimaarays.arvo || ""}</li>`;
    } else {
      // Kunnes parempi ratkaisu suunnitellaan
      modifiedString = `${modifiedString}<li class="list-disc">${path(
        ["meta", "changeObjects", "1", "properties", "value", "label"],
        alimaarays
      )}</li>`;
    }
  }

  if (hasAlimaarays) {
    forEach(alimaarays => {
      modifiedString = handleAlimaarays(
        alimaarays,
        modifiedString,
        locale,
        naytettavaArvo
      );
    }, alimaarays.aliMaaraykset);
  }

  modifiedString = `${modifiedString}</ul>`;
  return modifiedString;
};
