import React from "react";
import { Typography } from "@material-ui/core";
import common from "i18n/definitions/common";
import { useIntl } from "react-intl";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { NavLink, Redirect, Route, Router, useHistory } from "react-router-dom";
import Jarjestajat from "../Jarjestajat/index";
import BaseData from "basedata";
import JarjestajaSwitch from "../JarjestajaSwitch/index";
import { useUser } from "stores/user";
import Asianhallinta from "components/03-templates/Asianhallinta/index";
import { includes } from "ramda";
import { LocalizedSwitch } from "modules/i18n/index";
import { AppRoute } from "const/index";
import { localizeRouteKey } from "utils/common";

const keys2 = ["organisaatio", "tulevatLuvat"];

export default function KoulutusmuodonEtusivu({
  hakuavaimet,
  Jarjestajaluettelo,
  jarjestajatOtsikko,
  JarjestamislupaJSX,
  koulutusmuoto,
  kuvausteksti,
  paasivunOtsikko,
  UusiAsiaEsidialog,
  WizardContainer
}) {
  const history = useHistory();
  const { formatMessage, locale } = useIntl();
  const [userState] = useUser();
  const { data: user } = userState;

  const isEsittelija = user
    ? includes("OIVA_APP_ESITTELIJA", user.roles)
    : false;

  const koulutusmuotoUrl = localizeRouteKey(
    locale,
    AppRoute[koulutusmuoto.pascalCase],
    formatMessage
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 flex flex-col">
        <BreadcrumbsItem to={koulutusmuotoUrl}>
          {koulutusmuoto.paasivunOtsikko}
        </BreadcrumbsItem>
        <Router history={history}>
          <LocalizedSwitch>
            {!!user && (
              <Route
                path={AppRoute.Asianhallinta}
                render={() => (
                  <Asianhallinta
                    koulutusmuoto={koulutusmuoto}
                    user={user}
                    UusiAsiaEsidialog={UusiAsiaEsidialog}
                    WizardContainer={WizardContainer}
                  />
                )}
              />
            )}
            <Route
              path={AppRoute.Koulutustoimijat}
              render={props => {
                return (
                  <BaseData
                    keys={hakuavaimet}
                    locale={locale}
                    koulutustyyppi={koulutusmuoto.koulutustyyppi}
                    render={_props1 => {
                      //  Tämä toteutus olisi paljon yksinkertaisempi, jos
                      //  kaikkien opetusmuotojen lupatietojen noutamisen
                      //  voisi tehdä samalla tavalla. Vapaa sivistystyo
                      //  on kuitenkin poikkeus, koska VST-luvat noudetaan
                      //  lupaUuid:n avulla. Muiden koulutusmuotojen luvat
                      //  voidaan noutaa y-tunnusta käyttämällä.
                      //
                      //  Y-tunnuksen ollessa tiedossa, saadaan luvan
                      //  lisäksi noudettua myös organisaation tiedot.
                      //  VST:n tapauksessa täytyy noutaa ensin lupa
                      //  ja käyttää luvalta löytyvää y-tunnusta
                      //  organisaatiotietojen hakemiseen.
                      if (_props1.organisaatio) {
                        return (
                          <JarjestajaSwitch
                            JarjestamislupaJSX={JarjestamislupaJSX}
                            kohteet={_props1.kohteet}
                            koulutusmuoto={koulutusmuoto}
                            lupa={_props1.lupa}
                            organisation={_props1.organisaatio}
                            path={props.match.path}
                            user={user}
                            tulevatLuvat={_props1.tulevatLuvat}
                            voimassaOlevaLupa={_props1.voimassaOlevaLupa}
                            WizardContainer={WizardContainer}
                            ytunnus={_props1.ytunnus}
                          />
                        );
                      } else if (_props1.lupa && _props1.lupa.jarjestajaOid) {
                        return (
                          <BaseData
                            keys={keys2}
                            locale={locale}
                            koulutustyyppi={koulutusmuoto.koulutustyyppi}
                            render={_props2 => {
                              if (_props2.organisaatio) {
                                return (
                                  <JarjestajaSwitch
                                    JarjestamislupaJSX={JarjestamislupaJSX}
                                    kohteet={_props1.kohteet}
                                    koulutusmuoto={koulutusmuoto}
                                    lupa={_props1.lupa}
                                    lupaUuid={_props1.lupaUuid}
                                    organisation={_props2.organisaatio}
                                    path={props.match.path}
                                    tulevatLuvat={_props2.tulevatLuvat}
                                    voimassaOlevaLupa={
                                      _props1.voimassaOlevaLupa
                                    }
                                    WizardContainer={WizardContainer}
                                    user={user}
                                  />
                                );
                              }
                            }}
                            oppilaitostyyppi={
                              _props1.voimassaOlevaLupa
                                ? _props1.voimassaOlevaLupa.oppilaitostyyppi
                                : null
                            }
                            oid={_props1.lupa.jarjestajaOid}
                          />
                        );
                      }
                    }}
                  />
                );
              }}
            />
            <Route exact={true} path={AppRoute[koulutusmuoto.pascalCase]}>
              <article className="mx-auto w-4/5 mt-12 max-w-8xl">
                <Typography component="h1" variant="h1">
                  {paasivunOtsikko}
                </Typography>
                <p className="max-w-213 mb-6">{kuvausteksti}</p>
                {isEsittelija ? (
                  <p className="mb-6">
                    <NavLink
                      to={localizeRouteKey(
                        locale,
                        AppRoute.AsianhallintaAvoimet,
                        formatMessage,
                        {
                          koulutusmuoto: koulutusmuoto.kebabCase
                        }
                      )}
                      className="block underline"
                    >
                      {formatMessage(common.asianhallinta)}
                    </NavLink>
                  </p>
                ) : null}
                <Typography component="h2" variant="h2">
                  {jarjestajatOtsikko}
                </Typography>
                <section>
                  {Jarjestajaluettelo ? (
                    <Jarjestajat
                      koulutusmuoto={koulutusmuoto}
                      Jarjestajaluettelo={Jarjestajaluettelo}
                      paasivunOtsikko={paasivunOtsikko}
                    />
                  ) : null}
                </section>
              </article>
            </Route>
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </LocalizedSwitch>
        </Router>
      </div>
    </div>
  );
}
