import React, { useEffect } from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { useLuvat } from "../../stores/luvat";
import Jarjestajaluettelo from "./Jarjestajaluettelo";
import { Helmet } from "react-helmet";
import education from "../../i18n/definitions/education";
import Loading from "../../modules/Loading";
import { useIntl } from "react-intl";

const Jarjestajat = React.memo(() => {
  const intl = useIntl();
  const [luvat, luvatActions] = useLuvat();

  // Let's fetch LUVAT
  useEffect(() => {
    const abortController = luvatActions.load();
    return function cancel() {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [luvatActions]);

  return (
    <React.Fragment>
      <Helmet htmlAttributes={{ lang: intl.locale }}>
        <title>
          {intl.formatMessage(education.vocationalEducation)} - Oiva
        </title>
      </Helmet>

      <BreadcrumbsItem to="/ammatillinenkoulutus">
        {intl.formatMessage(education.vocationalEducation)}
      </BreadcrumbsItem>

      {luvat.isLoading === false && !luvat.isErroneous && (
        <Jarjestajaluettelo luvat={luvat.data} />
      )}
      {luvat.isLoading && <Loading />}
    </React.Fragment>
  );
});

export default Jarjestajat;