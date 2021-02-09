import React from "react";
import { useIntl } from "react-intl";
import { NavLink, Route, Router, useHistory } from "react-router-dom";
import common from "../../../i18n/definitions/common";
import education from "../../../i18n/definitions/education";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { Typography } from "@material-ui/core";
import { AppRoute } from "const/index";
import { LocalizedSwitch } from "modules/i18n/index";
import Asiat from "../Asiat/index";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { localizeRouteKey } from "utils/common";
import BaseData from "basedata";
import { MuutoksetContainer } from "stores/muutokset";

const Asianhallinta = ({ koulutusmuoto, user, WizardContainer }) => {
  const history = useHistory();
  const { formatMessage, locale } = useIntl();

  const asianhallintaAvoimetUrl = localizeRouteKey(
    locale,
    AppRoute.AsianhallintaAvoimet,
    formatMessage,
    { koulutusmuoto: koulutusmuoto.kebabCase }
  );

  const asianhallintaPaatetytUrl = localizeRouteKey(
    locale,
    AppRoute.AsianhallintaPaatetyt,
    formatMessage,
    { koulutusmuoto: koulutusmuoto.kebabCase }
  );

  return (
    <React.Fragment>
      <Router history={history}>
        <LocalizedSwitch>
          <Route
            authenticated={!!user}
            exact
            path={AppRoute.AsianhallintaAvoimet}
            render={() => (
              <React.Fragment>
                <BreadcrumbsItem to={asianhallintaAvoimetUrl}>
                  {formatMessage(common.asiatOpen)}
                </BreadcrumbsItem>
                <Asiat koulutusmuoto={koulutusmuoto} user={user} />
              </React.Fragment>
            )}
          />
          <Route
            authenticated={!!user}
            exact
            path={AppRoute.AsianhallintaPaatetyt}
            render={() => (
              <React.Fragment>
                <BreadcrumbsItem to={asianhallintaPaatetytUrl}>
                  {formatMessage(common.asiatReady)}
                </BreadcrumbsItem>
                <Asiat koulutusmuoto={koulutusmuoto} user={user} />
              </React.Fragment>
            )}
          />
          <Route
            authenticated={!!user}
            exact
            path={AppRoute.UusiHakemus}
            render={() => (
              <BaseData
                locale={locale}
                koulutustyyppi={koulutusmuoto.koulutustyyppi}
                render={_props => {
                  return (
                    <MuutoksetContainer>
                      <WizardContainer
                        kohteet={_props.kohteet}
                        koulutukset={_props.koulutukset}
                        koulutusalat={_props.koulutusalat}
                        koulutusmuoto={koulutusmuoto}
                        koulutustyypit={_props.koulutustyypit}
                        lisatiedot={_props.lisatiedot}
                        maaraystyypit={_props.maaraystyypit}
                        muut={_props.muut}
                        opetuskielet={_props.opetuskielet}
                        organisaatio={_props.organisaatio}
                        role={"ESITTELIJA"}
                        viimeisinLupa={_props.viimeisinLupa}
                      />
                    </MuutoksetContainer>
                  );
                }}
              />
            )}
          />
          <Route
            authenticated={!!user}
            exact
            path={AppRoute.Hakemus}
            render={() => {
              return (
                <BaseData
                  locale={locale}
                  koulutustyyppi={koulutusmuoto.koulutustyyppi}
                  render={_props => {
                    return (
                      <MuutoksetContainer>
                        <WizardContainer
                          kohteet={_props.kohteet}
                          koulutukset={_props.koulutukset}
                          koulutusalat={_props.koulutusalat}
                          koulutusmuoto={koulutusmuoto}
                          koulutustyypit={_props.koulutustyypit}
                          lisatiedot={_props.lisatiedot}
                          maaraystyypit={_props.maaraystyypit}
                          muut={_props.muut}
                          opetuskielet={_props.opetuskielet}
                          organisaatio={_props.organisaatio}
                          role={"ESITTELIJA"}
                          viimeisinLupa={_props.viimeisinLupa}
                        />
                      </MuutoksetContainer>
                    );
                  }}
                />
              );
            }}
          />
          <Route path="*">
            <div className="flex-1 bg-gray-100">
              <div className="border border-gray-300 max-w-7xl m-auto bg-white mt-12 px-64 py-12">
                <Typography component="h1" variant="h1">
                  {formatMessage(common.asianhallinta)}
                </Typography>
                <p>{formatMessage(common.asianhallintaInfoText)}</p>
                <div className="grid grid-cols-3 gap-4 justify-items-auto pt-12">
                  <NavLink
                    className="font-semibold px-4 py-8 bg-white border border-gray-300 flex justify-center items-center"
                    to={"/asianhallinta/esijaperusopetus"}
                    exact={true}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {formatMessage(education.preAndBasicEducation)}
                    <ArrowForwardIcon className="ml-4" />
                  </NavLink>
                  <NavLink
                    className="font-semibold px-4 py-8 bg-white border border-gray-300 flex justify-center items-center"
                    to={"/asianhallinta/lukio"}
                    exact={true}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {formatMessage(education.highSchoolEducation)}
                    <ArrowForwardIcon className="ml-4" />
                  </NavLink>
                  <NavLink
                    className="font-semibold px-4 py-8 bg-white border border-gray-300 flex justify-center items-center"
                    to={"/asianhallinta/ammatillinen"}
                    exact={true}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {formatMessage(education.vocationalEducation)}
                    <ArrowForwardIcon className="ml-4" />
                  </NavLink>
                </div>
              </div>
            </div>
          </Route>
        </LocalizedSwitch>
      </Router>
    </React.Fragment>
  );
};

export default Asianhallinta;
