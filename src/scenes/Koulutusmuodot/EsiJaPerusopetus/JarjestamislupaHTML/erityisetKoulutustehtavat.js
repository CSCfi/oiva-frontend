import React, { useEffect, useState } from "react";
import {
  addIndex,
  filter,
  find,
  isEmpty,
  length,
  map,
  path,
  pathEq,
  propEq,
  sortBy,
  toUpper
} from "ramda";
import { useIntl } from "react-intl";
import education from "../../../../i18n/definitions/education";
import { getPOErityisetKoulutustehtavatFromStorage } from "helpers/poErityisetKoulutustehtavat";
import Typography from "@material-ui/core/Typography";
import { getRajoitteetFromMaarays } from "utils/rajoitteetUtils";
import { getLocalizedProperty } from "services/lomakkeet/utils";
import LisatiedotHtmlLupa from "../../../LisatiedotHtmlLupa";
import rajoitteet from "i18n/definitions/rajoitteet";

export default function PoOpetuksenErityisetKoulutustehtavatHtml({
  maaraykset
}) {
  const intl = useIntl();
  const localeUpper = toUpper(intl.locale);
  const [
    erityisetKoulutustehtavatKoodisto,
    setErityisetKoulutustehtavatKoodisto
  ] = useState([]);

  /** Fetch opetuksenJarjestamismuodot from storage */
  useEffect(() => {
    getPOErityisetKoulutustehtavatFromStorage()
      .then(erityisetKoulutustehtavat =>
        setErityisetKoulutustehtavatKoodisto(erityisetKoulutustehtavat)
      )
      .catch(err => {
        console.error(err);
      });
  }, []);

  const erityisetKoulutustehtavatMaaraykset = sortBy(
    m => parseFloat(`${m.koodiarvo}.${path(["meta", "ankkuri"], m)}`),
    filter(
      maarays =>
        pathEq(["kohde", "tunniste"], "erityinenkoulutustehtava", maarays) &&
        maarays.koodisto === "poerityinenkoulutustehtava",
      maaraykset
    )
  );

  const lisatietomaarays = find(
    maarays =>
      pathEq(["kohde", "tunniste"], "erityinenkoulutustehtava", maarays) &&
      maarays.koodisto === "lisatietoja",
    maaraykset
  );

  return !isEmpty(erityisetKoulutustehtavatMaaraykset) &&
    !isEmpty(erityisetKoulutustehtavatKoodisto) ? (
    <div className="mt-4">
      <Typography component="h3" variant="h3">
        {intl.formatMessage(education.erityisetKoulutustehtavat)}
      </Typography>

      <ul className="ml-8 list-disc mb-4">
        {addIndex(map)((maarays, index) => {
          let naytettavaArvo = path(["meta", "kuvaus"], maarays);

          if (!naytettavaArvo) {
            const koodistosta = find(
              propEq("koodiarvo", maarays.koodiarvo),
              erityisetKoulutustehtavatKoodisto
            );

            naytettavaArvo = getLocalizedProperty(
              koodistosta.metadata,
              localeUpper,
              "kuvaus"
            );
          }

          const result = (
            <React.Fragment key={`${maarays.koodiarvo}-${index}`}>
              <li className="leading-bulletList">{naytettavaArvo}</li>

              {length(maarays.aliMaaraykset)
                ? getRajoitteetFromMaarays(
                    maarays.aliMaaraykset,
                    localeUpper,
                    intl.formatMessage(rajoitteet.ajalla),
                    "kuvaus"
                  )
                : ""}
            </React.Fragment>
          );
          return result;
        }, erityisetKoulutustehtavatMaaraykset)}
      </ul>
      <LisatiedotHtmlLupa lisatietomaarays={lisatietomaarays} />
    </div>
  ) : null;
}
