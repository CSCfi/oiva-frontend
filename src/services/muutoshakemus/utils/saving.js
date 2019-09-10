import getChangesOfTutkinnotJaKoulutukset from "./tutkinnot-ja-koulutukset";
import { getChangesOfOpetuskielet } from "./opetus-ja-tutkintokieli";
import getChangesOfOpiskelijavuodet from "./opiskelijavuodet";
import { getChangesOfTutkintokielet } from "./opetus-ja-tutkintokieli";
import getChangesOfToimintaalue from "./toiminta-alue";
import getChangesOfMuut from "./muut";
import moment from "moment";
import * as R from "ramda";

export function createObjectToSave(
  lupa,
  changeObjects,
  backendMuutokset = [],
  muutoshakemus,
  uuid,
  muutospyynto
) {
  return {
    diaarinumero: lupa.data.diaarinumero,
    jarjestajaOid: lupa.data.jarjestajaOid,
    jarjestajaYtunnus: lupa.data.jarjestajaYtunnus,
    luoja: sessionStorage.getItem("username"),
    // luontipvm: moment().valueOf(),
    luontipvm: moment().format("YYYY-MM-DD"),
    lupaUuid: lupa.data.uuid,
    // uuid: lupa.data.asiatyyppi.uuid,
    tila: "LUONNOS",
    paivittaja: "string",
    paivityspvm: null,
    voimassaalkupvm: lupa.data.alkupvm,
    voimassaloppupvm: "2019-12-31", // TODO: find the correct value somehow
    meta: {
      meta: {},
      taloudelliset: {
        taloudelliset: []
      }
    },
    muutokset: R.flatten([
      getChangesOfTutkinnotJaKoulutukset(
        changeObjects,
        muutoshakemus.tutkinnot,
        muutoshakemus.koulutukset
      ),
      getChangesOfOpetuskielet(
        R.path(["kielet", "opetuskielet"], muutoshakemus),
        R.flatten([
          R.path(["kielet", "opetuskielet"], changeObjects) || [],
          R.path(["perustelut", "kielet", "opetuskielet"], changeObjects) || []
        ]),
        R.filter(R.propEq("koodisto", "oppilaitoksenopetuskieli"))(
          backendMuutokset
        )
      )
      // getChangesOfTutkintokielet(muutoshakemus.tutkintokielet),
      // getChangesOfToimintaalue(muutoshakemus.toimintaalue, muutospyynto),
      // getChangesOfOpiskelijavuodet(muutoshakemus.opiskelijavuodet),
      // getChangesOfMuut(muutoshakemus.muut)
    ]),
    liitteet: [],
    uuid
  };
}
