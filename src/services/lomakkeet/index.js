import { getTaloudellisetlomake } from "./taloudelliset";
import { append, path } from "ramda";
import { setLocale } from "./i18n-config";
import { getCheckboxes } from "./perustelut/muutostarpeet";
import getKuljettajakoulutuslomake from "./koulutukset/kuljettajakoulutukset";
import getTyovoimakoulutuslomake from "./koulutukset/tyovoimakoulutukset";
import getATVKoulutuksetLomake from "./koulutukset/atvKoulutukset";
import getValmentavatKoulutuksetLomake from "./koulutukset/valmentavatKoulutukset";
import getTutkinnotLomake from "./tutkinnot";
import getOpetuskieletLomake from "./kielet/opetuskielet";
import getTutkintokieletLomake from "./kielet/tutkintokielet";
import getToimintaaluelomake from "./toimintaalue";
import getOpiskelijavuodetLomake from "./opiskelijavuodet";
import getPerustelutLiitteetlomake from "./perustelut/liitteet";
import getYhteenvetoLiitteetLomake from "./yhteenveto/liitteet";
import getYhteenvetoYleisetTiedotLomake from "./yhteenveto/yleisetTiedot";
import getTopThree from "./esittelija";

// Rajoitelomake (yksi ja sama toteutus koulutusmuodosta riippumatta)
import { rajoitelomake } from "./rajoitteet/rajoitedialogi/rajoitelomake";

// Ammatillisen koulutuksen muokkauslomakkeet
import { getMuutLaajennettu } from "./ammatillinenKoulutus/5-muut/laajennettuOppisopimuskoulutus";
import { getMuutVaativaTuki } from "./ammatillinenKoulutus/5-muut/vaativaTuki";
import { getMuutSisaoppilaitos } from "./ammatillinenKoulutus/5-muut/sisaoppilaitos";
import { getMuutVankila } from "./ammatillinenKoulutus/5-muut/vankila";
import { getMuutUrheilu } from "./ammatillinenKoulutus/5-muut/urheilu";
import { getMuutYhteistyo } from "./ammatillinenKoulutus/5-muut/yhteistyo";
import { getMuutYhteistyosopimus } from "./ammatillinenKoulutus/5-muut/yhteistyosopimus";
import { getMuutSelvitykset } from "./ammatillinenKoulutus/5-muut/selvitykset";
import { getMuutMuuMaarays } from "./ammatillinenKoulutus/5-muut/muuMaarays";

// Ammatillisen koulutuksen esikatselulomakkeet
import previewOfTutkinnot from "./ammatillinenKoulutus/esikatselu/1-tutkinnot";

// Esi -ja perusopetuksen muokkauslomakkeet
import { opetusJotaLupaKoskee } from "./esi-ja-perusopetus/1-opetusJotaLupaKoskee";
import getPaatoksenTiedot from "./esi-ja-perusopetus/0-paatoksenTiedot";
import { getOpetuskieletOPHLomake } from "./esi-ja-perusopetus/3-opetuskielet";
import { opetuksenJarjestamismuoto } from "./esi-ja-perusopetus/4-opetuksenJarjestamismuoto";
import { getOpiskelijamaaratLomake } from "./esi-ja-perusopetus/6-opiskelijamaarat";
import { erityisetKoulutustehtavat } from "./esi-ja-perusopetus/5-erityisetKoulutustehtavat";
import { muutEhdot } from "./esi-ja-perusopetus/7-muutEhdot";
import { opetustaAntavatKunnat } from "./esi-ja-perusopetus/2-opetustaAntavatKunnat";

// Esi- ja perusopetuksen esikatselulomakkeet
import { previewOfOpetusJotaLupaKoskee } from "./esi-ja-perusopetus/esikatselu/1-opetusJotaLupaKoskee";
import { previewOfOpetuksenJarjestamismuoto } from "./esi-ja-perusopetus/esikatselu/4-opetuksenJarjestamismuoto";

// Lukiokoulutuksen muokkauslomakkeet
import getPaatoksenTiedotLukio from "./lukiokoulutus/0-paatoksenTiedot";
import { opetustaAntavatKunnat as opetustaAntavatKunnatLukio } from "./lukiokoulutus/1-opetustaAntavatKunnat";
import { getOpetuskieletOPHLomake as getOpetuskieletOPHLomakeLukio } from "./lukiokoulutus/2-opetuskielet";
import { getOikeusSisaoppilaitosmuotoiseenKoulutukseen } from "./lukiokoulutus/3-oikeusSisaoppilaitosmuotoiseenKoulutukseen";
import { getErityisetKoulutustehtavatLukio } from "./lukiokoulutus/4-erityisetKoulutustehtavat";
import { getValtakunnallinenKehittamistehtavalomake } from "./lukiokoulutus/5-valtakunnallinenKehittamistehtava";
import { getOpiskelijamaaratLomake as getOpiskelijamaaratLomakeLukio } from "./lukiokoulutus/6-opiskelijamaarat";
import { muutEhdot as muutEhdotLukio } from "./lukiokoulutus/7-muutEhdot";
// Lukiokoulutuksen esikatselulomakkeet
import { previewOfOikeusSisaoppilaitosmuotoiseenKoulutukseen } from "./lukiokoulutus/esikatselu/3-oikeusSisaoppilaitosmuotoiseenKoulutukseen";
import { previewOfValtakunnallinenKehittamistehtava } from "./lukiokoulutus/esikatselu/5-valtakunnallinenKehittamistehtava";

import { previewOfPaatoksentiedot } from "./esi-ja-perusopetus/esikatselu/0-paatoksenTiedot";
import { rajoitteet } from "./rajoitteet/index";
import { previewOfDynaamisetTekstikentat } from "./yhteiset/esikatselu/dynaamisetTekstikentat";
import { previewOfOpetuskielet } from "./yhteiset/esikatselu/opetuskielet";
import { previewOfOpiskelijamaarat } from "./yhteiset/esikatselu/opiskelijamaarat";
import { previewOfOpetustaAntavaKunnat } from "./yhteiset/esikatselu/opetustaAntavatKunnat";

/**
 * LOMAKEPALVELU
 */
const lomakkeet = {
  /**
   * AMMATILLINEN KOULUTUS
   */
  ammatillinenKoulutus: {
    muut: {
      laajennettuOppisopimuskoulutus: {
        modification: (data, booleans, locale) =>
          getMuutLaajennettu("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutLaajennettu("reasoning", data, booleans, locale, changeObjects)
      },
      muuMaarays: {
        modification: (data, booleans, locale) =>
          getMuutMuuMaarays("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutMuuMaarays("reasoning", data, booleans, locale, changeObjects)
      },
      sisaoppilaitos: {
        modification: (data, booleans, locale) =>
          getMuutSisaoppilaitos("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutSisaoppilaitos(
            "reasoning",
            data,
            booleans,
            locale,
            changeObjects
          )
      },
      urheilu: {
        modification: (data, booleans, locale) =>
          getMuutUrheilu("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutUrheilu("reasoning", data, booleans, locale, changeObjects)
      },
      selvitykset: {
        modification: (data, booleans, locale) =>
          getMuutSelvitykset("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutSelvitykset("reasoning", data, booleans, locale, changeObjects)
      },
      vaativaTuki: {
        modification: (data, booleans, locale) =>
          getMuutVaativaTuki("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutVaativaTuki("reasoning", data, booleans, locale, changeObjects)
      },
      vankila: {
        modification: (data, booleans, locale) =>
          getMuutVankila("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutVankila("reasoning", data, booleans, locale, changeObjects)
      },
      yhteistyo: {
        modification: (data, booleans, locale) =>
          getMuutYhteistyo("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutYhteistyo("reasoning", data, booleans, locale, changeObjects)
      },
      yhteistyosopimus: {
        modification: (data, booleans, locale) =>
          getMuutYhteistyosopimus("modification", data, booleans, locale),
        reasoning: (data, booleans, locale, changeObjects) =>
          getMuutYhteistyosopimus(
            "reasoning",
            data,
            booleans,
            locale,
            changeObjects
          )
      }
    }
  },

  // Wizard page 1 forms
  tutkinnot: {
    modification: (data, booleans, locale) =>
      getTutkinnotLomake("modification", data, booleans, locale),
    preview: (data, booleans, locale) =>
      previewOfTutkinnot(data, booleans, locale),
    reasoning: (data, booleans, locale, changeObjects) =>
      getTutkinnotLomake("reasoning", data, booleans, locale, changeObjects)
  },
  koulutukset: {
    atvKoulutukset: {
      // atv = ammatilliseen tehtävään valmistavat
      modification: (data, booleans) =>
        getATVKoulutuksetLomake("modification", data, booleans),
      reasoning: (data, booleans, locale, changeObjects, functions, prefix) =>
        getATVKoulutuksetLomake(
          "reasoning",
          data,
          booleans,
          locale,
          changeObjects,
          functions,
          prefix
        )
    },
    kuljettajakoulutukset: {
      modification: (data, booleans) =>
        getKuljettajakoulutuslomake("modification", data, booleans),
      reasoning: (data, booleans, locale, changeObjects, functions, prefix) =>
        getKuljettajakoulutuslomake(
          "reasoning",
          data,
          booleans,
          locale,
          changeObjects,
          functions,
          prefix
        )
    },
    tyovoimakoulutukset: {
      modification: (data, booleans) =>
        getTyovoimakoulutuslomake("modification", data, booleans),
      reasoning: (data, booleans, locale, changeObjects, functions, prefix) =>
        getTyovoimakoulutuslomake(
          "reasoning",
          data,
          booleans,
          locale,
          changeObjects,
          functions,
          prefix
        )
    },
    valmentavatKoulutukset: {
      modification: (data, booleans) =>
        getValmentavatKoulutuksetLomake("modification", data, booleans),
      reasoning: (data, booleans, locale, changeObjects, functions, prefix) =>
        getValmentavatKoulutuksetLomake(
          "reasoning",
          data,
          booleans,
          locale,
          changeObjects,
          functions,
          prefix
        )
    }
  },
  kielet: {
    opetuskielet: {
      modification: (data, booleans, locale) =>
        getOpetuskieletLomake("modification", data, booleans, locale),
      reasoning: (data, booleans, locale, changeObjects) =>
        getOpetuskieletLomake(
          "reasoning",
          data,
          booleans,
          locale,
          changeObjects
        )
    },
    tutkintokielet: {
      modification: (data, booleans, locale) =>
        getTutkintokieletLomake("modification", data, booleans, locale),
      reasoning: (data, booleans, locale, changeObjects) =>
        getTutkintokieletLomake(
          "reasoning",
          data,
          booleans,
          locale,
          changeObjects
        )
    }
  },
  toimintaalue: {
    modification: (data, booleans, locale, changeObjects, functions) =>
      getToimintaaluelomake(
        "modification",
        data,
        booleans,
        locale,
        changeObjects,
        functions
      ),
    reasoning: (data, booleans, locale, changeObjects, functions, prefix) =>
      getToimintaaluelomake(
        "reasoning",
        data,
        booleans,
        locale,
        changeObjects,
        functions,
        prefix
      )
  },
  opiskelijavuodet: {
    modification: (data, booleans, locale, changeObjects) =>
      getOpiskelijavuodetLomake(
        "modification",
        data,
        booleans,
        locale,
        changeObjects
      ),
    reasoning: (data, booleans, locale, changeObjects) =>
      getOpiskelijavuodetLomake(
        "reasoning",
        data,
        booleans,
        locale,
        changeObjects
      )
  },

  // Wizard page 2 forms
  perustelut: {
    liitteet: {
      reasoning: (data, booleans) =>
        getPerustelutLiitteetlomake("reasoning", booleans)
    },
    muutostarpeet: {
      checkboxes: (data, booleans, locale) =>
        getCheckboxes(data.checkboxItems, locale, booleans)
    }
  },
  taloudelliset: {
    yleisettiedot: (data, booleans) =>
      getTaloudellisetlomake("yleisettiedot", data, booleans),
    investoinnit: (data, booleans) =>
      getTaloudellisetlomake("investoinnit", data, booleans),
    tilinpaatostiedot: (data, booleans) =>
      getTaloudellisetlomake("tilinpaatostiedot", data, booleans),
    liitteet: (data, booleans) =>
      getTaloudellisetlomake("liitteet", data, booleans)
  },
  yhteenveto: {
    liitteet: {
      modification: () => getYhteenvetoLiitteetLomake("modification")
    },
    yleisetTiedot: {
      modification: (data, booleans) =>
        getYhteenvetoYleisetTiedotLomake("modification", data, booleans)
    }
  },

  // Esittelija
  esittelija: {
    topThree: {
      addition: (data, booleans, locale, changeObjects) =>
        getTopThree(data, booleans, locale, changeObjects)
    }
  },

  // Esi- ja perusopetus
  esiJaPerusopetus: {
    erityisetKoulutustehtavat: {
      modification: (data, booleans, locale, changeObjects, functions) =>
        erityisetKoulutustehtavat(
          data,
          booleans,
          locale,
          changeObjects,
          functions
        ),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfDynaamisetTekstikentat(data, booleans, locale, changeObjects)
    },
    muutEhdot: {
      modification: (data, booleans, locale, changeObjects, functions) =>
        muutEhdot(data, booleans, locale, changeObjects, functions),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfDynaamisetTekstikentat(data, booleans, locale, changeObjects)
    },
    opetuksenJarjestamismuodot: {
      modification: (data, booleans, locale) =>
        opetuksenJarjestamismuoto(data, booleans, locale),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfOpetuksenJarjestamismuoto(
          data,
          booleans,
          locale,
          changeObjects
        )
    },
    opetusJotaLupaKoskee: {
      modification: (data, booleans, locale, changeObjects) =>
        opetusJotaLupaKoskee(data, booleans, locale, changeObjects),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfOpetusJotaLupaKoskee(data, booleans, locale, changeObjects)
    },
    opetuskielet: {
      modification: (data, booleans, locale, changeObjects) =>
        getOpetuskieletOPHLomake(data, booleans, locale, changeObjects),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfOpetuskielet(data, booleans, locale, changeObjects)
    },
    opiskelijamaarat: {
      modification: (data, booleans, locale) =>
        getOpiskelijamaaratLomake(data, booleans, locale),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfOpiskelijamaarat(data, booleans, locale, changeObjects)
    },
    paatoksenTiedot: {
      addition: (data, booleans, locale, changeObjects) =>
        getPaatoksenTiedot(data, booleans, locale, changeObjects),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfPaatoksentiedot(data, booleans, locale, changeObjects)
    },
    opetustaAntavatKunnat: {
      modification: (data, booleans, locale, changeObjects, functions) =>
        opetustaAntavatKunnat(data, booleans, locale, changeObjects, functions),
      preview: (data, booleans, locale, changeObjects, functions) =>
        previewOfOpetustaAntavaKunnat(
          data,
          booleans,
          locale,
          changeObjects,
          functions
        )
    }
  },
  // Lukiokoulutus
  lukiokoulutus: {
    erityisetKoulutustehtavat: {
      modification: (data, booleans, locale, changeObjects, functions) =>
        getErityisetKoulutustehtavatLukio(
          data,
          booleans,
          locale,
          changeObjects,
          functions
        ),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfDynaamisetTekstikentat(data, booleans, locale, changeObjects)
    },
    muutEhdot: {
      modification: (data, booleans, locale, changeObjects, functions) =>
        muutEhdotLukio(data, booleans, locale, changeObjects, functions),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfDynaamisetTekstikentat(data, booleans, locale, changeObjects)
    },
    oikeusSisaoppilaitosmuotoiseenKoulutukseen: {
      modification: (data, booleans, locale) =>
        getOikeusSisaoppilaitosmuotoiseenKoulutukseen(data, booleans, locale),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfOikeusSisaoppilaitosmuotoiseenKoulutukseen(
          data,
          booleans,
          locale,
          changeObjects
        )
    },
    valtakunnallinenKehittamistehtava: {
      modification: (data, booleans, locale, changeObjects) =>
        getValtakunnallinenKehittamistehtavalomake(
          data,
          booleans,
          locale,
          changeObjects
        ),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfValtakunnallinenKehittamistehtava(
          data,
          booleans,
          locale,
          changeObjects
        )
    },
    opetuskielet: {
      modification: (data, booleans, locale, changeObjects) =>
        getOpetuskieletOPHLomakeLukio(data, booleans, locale, changeObjects),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfOpetuskielet(data, booleans, locale, changeObjects)
    },
    opiskelijamaarat: {
      modification: (data, booleans, locale) =>
        getOpiskelijamaaratLomakeLukio(data, booleans, locale),
      preview: (data, booleans, locale, changeObjects) =>
        previewOfOpiskelijamaarat(data, booleans, locale, changeObjects)
    },
    paatoksenTiedot: {
      addition: (data, booleans, locale, changeObjects) =>
        getPaatoksenTiedotLukio(data, booleans, locale, changeObjects)
    },
    opetustaAntavatKunnat: {
      modification: (data, booleans, locale, changeObjects, functions) =>
        opetustaAntavatKunnatLukio(
          data,
          booleans,
          locale,
          changeObjects,
          functions
        ),
      preview: (data, booleans, locale, changeObjects, functions) =>
        previewOfOpetustaAntavaKunnat(
          data,
          booleans,
          locale,
          changeObjects,
          functions
        )
    }
  },
  rajoitteet: {
    listaus: (data, booleans, locale, changeObjects, functions) =>
      rajoitteet(data, booleans, locale, changeObjects, functions),
    rajoitedialogi: {
      modification: (data, booleans, locale, changeObjects, functions) =>
        rajoitelomake(data, booleans, locale, changeObjects, functions)
    }
  }
};

export async function getLomake(
  mode = "addition",
  changeObjects = [],
  data = {},
  functions = {},
  booleans,
  locale,
  _path = [],
  prefix
) {
  // This defines the language of the requested form.
  setLocale(locale);
  const fn = path(append(mode, _path), lomakkeet);
  const lomake = fn
    ? await fn(data, booleans, locale, changeObjects, functions, prefix)
    : [];
  return lomake;
}
