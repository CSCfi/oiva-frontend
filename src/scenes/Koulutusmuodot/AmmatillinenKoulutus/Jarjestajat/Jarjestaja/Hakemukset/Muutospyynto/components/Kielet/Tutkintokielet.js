import React from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { useLomakedata } from "stores/lomakedata";
import Koulutusala from "./Koulutusala";
import {
  compose,
  equals,
  filter,
  length,
  map,
  prop,
  toUpper,
  where
} from "ramda";
import wizard from "i18n/definitions/wizard";
import Typography from "@material-ui/core/Typography";
import { TutkintomuutoksetContainer } from "stores/tutkintomuutokset";

const Tutkintokielet = ({ koulutusalat, maaraykset, mode }) => {
  const sectionId = "kielet_tutkintokielet";
  const intl = useIntl();

  const [tutkintodata] = useLomakedata({
    anchor: "tutkinnot"
  });

  console.info(sectionId, mode, tutkintodata);
  return (
    <React.Fragment>
      <Typography component="h4" variant="h4">
        {intl.formatMessage(wizard.tutkintokielet)}
      </Typography>
      {map(koulutusala => {
        const aktiivisetTutkinnot = filter(
          compose(where({ isChecked: equals(true) }), prop("properties")),
          prop(koulutusala.koodiarvo, tutkintodata) || []
        );
        if (length(aktiivisetTutkinnot) || mode === "reasoning") {
          return (
            <TutkintomuutoksetContainer
              key={koulutusala.koodiarvo}
              scope={`tutkintokielet_${koulutusala.koodiarvo}`}
            >
              <Koulutusala
                aktiivisetTutkinnot={aktiivisetTutkinnot}
                koodiarvo={koulutusala.koodiarvo}
                koulutusalakoodiarvo={koulutusala.koodiarvo}
                maaraykset={maaraykset}
                mode={mode}
                sectionId={`${sectionId}_${koulutusala.koodiarvo}`}
                title={`${koulutusala.metadata[toUpper(intl.locale)].nimi}`}
              />
            </TutkintomuutoksetContainer>
          );
        } else {
          return null;
        }
      }, koulutusalat).filter(Boolean)}
    </React.Fragment>
  );
};

Tutkintokielet.propTypes = {
  koulutusalat: PropTypes.array
};

export default Tutkintokielet;
