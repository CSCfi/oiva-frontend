import React, { useMemo, useState, useCallback } from "react";
import { useChangeObjects } from "../../stores/changeObjects";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import {
  parseKoulutusalat,
  parseKoulutuksetAll
} from "../../utils/koulutusParser";
import * as R from "ramda";
import { sortLanguages } from "../../utils/kieliUtil";
import { mapObjIndexed, prop, sortBy } from "ramda";
import { getMaakuntakunnatList } from "../../utils/toimialueUtil";
import { useLomakkeet } from "../../stores/lomakkeet";
import { useKoulutukset } from "../../stores/koulutukset";
import { useKoulutusalat } from "../../stores/koulutusalat";
import { useOpetuskielet } from "../../stores/opetuskielet";
import DialogTitle from "okm-frontend-components/dist/components/02-organisms/DialogTitle";
import ConfirmDialog from "okm-frontend-components/dist/components/02-organisms/ConfirmDialog";
import wizardMessages from "../../i18n/definitions/wizard";
import { HAKEMUS_VIESTI } from "../Jarjestajat/Jarjestaja/Hakemukset/Muutospyynto/modules/uusiHakemusFormConstants";
import { withStyles } from "@material-ui/styles";
import { DialogContent, Dialog } from "@material-ui/core";
import { useKielet } from "../../stores/kielet";
import { useTutkinnot } from "../../stores/tutkinnot";
import EsittelijatWizardActions from "./EsittelijatWizardActions";
import EsittelijatMuutospyynto from "./EsittelijatMuutospyynto";
import { useHistory } from "react-router-dom";
import SimpleButton from "okm-frontend-components/dist/components/00-atoms/SimpleButton";

const isDebugOn = process.env.REACT_APP_DEBUG === "true";

const DialogTitleWithStyles = withStyles(() => ({
  root: {
    backgroundColor: "#c8dcc3",
    paddingBottom: "1rem",
    paddingTop: "1rem",
    width: "100%"
  }
}))(props => {
  return <DialogTitle {...props}>{props.children}</DialogTitle>;
});

const DialogContentWithStyles = withStyles(() => ({
  root: {
    backgroundColor: "#ffffff",
    padding: 0,
    scrollBehavior: "smooth"
  }
}))(props => {
  return <DialogContent {...props}>{props.children}</DialogContent>;
});

const FormDialog = withStyles(() => ({
  paper: {
    background: "#ffffff",
    marginLeft: isDebugOn ? "33%" : 0,
    width: isDebugOn ? "66%" : "100%"
  }
}))(props => {
  return <Dialog {...props}>{props.children}</Dialog>;
});

const defaultProps = {
  backendMuutokset: [],
  elykeskukset: [],
  kohteet: [],
  koulutustyypit: [],
  kunnat: [],
  lupa: {},
  lupaKohteet: {},
  maakunnat: [],
  maakuntakunnat: [],
  maaraystyypit: [],
  muut: [],
  muutosperusteluList: [],
  organisation: {},
  vankilat: []
};

const UusiAsiaDialog = ({
  backendMuutokset = defaultProps.backendMuutokset,
  elykeskukset = defaultProps.elykeskukset,
  kohteet = defaultProps.kohteet,
  koulutustyypit = defaultProps.koulutustyypit,
  kunnat = defaultProps.kunnat,
  lupa = defaultProps.lupa,
  lupaKohteet = defaultProps.lupaKohteet,
  maakunnat = defaultProps.maakunnat,
  maakuntakunnat = defaultProps.maakuntakunnat,
  maaraystyypit = defaultProps.maaraystyypit,
  muut = defaultProps.muut,
  muutosperusteluList = defaultProps.muutosperusteluList,
  onNewDocSave,
  organisation = defaultProps.organisation,
  vankilat = defaultProps.vankilat
}) => {
  const intl = useIntl();
  let history = useHistory();
  const [cos, coActions] = useChangeObjects(); // cos means change objects
  const [kielet] = useKielet();
  const [opetuskielet] = useOpetuskielet();
  const [koulutusalat] = useKoulutusalat();
  const [tutkinnot] = useTutkinnot();
  const [koulutukset] = useKoulutukset();
  const [lomakkeet] = useLomakkeet();

  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [isSavingEnabled, setIsSavingEnabled] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const organisationPhoneNumber = R.head(
    R.values(R.find(R.prop("numero"), organisation.yhteystiedot))
  );

  const organisationEmail = R.head(
    R.values(R.find(R.prop("email"), organisation.yhteystiedot))
  );

  const organisationWebsite = R.head(
    R.values(R.find(R.prop("www"), organisation.yhteystiedot))
  );

  const kieletAndOpetuskielet = useMemo(() => {
    return {
      kielet: sortLanguages(kielet.data, R.toUpper(intl.locale)),
      opetuskielet: opetuskielet.data
    };
  }, [kielet.data, opetuskielet.data, intl.locale]);

  const parsedKoulutusalat = useMemo(() => {
    return parseKoulutusalat(koulutusalat.data);
  }, [koulutusalat.data]);

  const parsedTutkinnot = useMemo(() => {
    return parseKoulutuksetAll(
      tutkinnot.data || [],
      parsedKoulutusalat || [],
      koulutustyypit || []
    );
  }, [tutkinnot.data, parsedKoulutusalat, koulutustyypit]);

  const parsedKoulutukset = useMemo(() => {
    return {
      muut: mapObjIndexed((num, key, obj) => {
        return sortBy(prop("koodiArvo"), obj[key].data);
      }, koulutukset.muut),
      poikkeukset: mapObjIndexed((num, key, obj) => {
        return obj[key].data;
      }, koulutukset.poikkeukset)
    };
  }, [koulutukset]);

  const maakuntakunnatList = useMemo(() => {
    return getMaakuntakunnatList(maakuntakunnat, R.toUpper(intl.locale));
  }, [intl.locale, maakuntakunnat]);

  /**
   * The function is mainly called by FormSection.
   */
  const onSectionChangesUpdate = useCallback(
    (id, changeObjects) => {
      if (id && changeObjects) {
        coActions.set(id, changeObjects);
      }
    },
    [coActions]
  );

  const openCancelModal = () => {
    setIsConfirmDialogVisible(true);
  };

  function handleCancel() {
    setIsConfirmDialogVisible(false);
  }

  /**
   * User is redirected to the following path when the form is closed.
   */
  const closeWizard = useCallback(() => {
    setIsDialogOpen(false);
    setIsConfirmDialogVisible(false);
    return history.push(`/asiat`);
  }, [history]);

  const onAction = useCallback(async action => {
    if (action === "save") {
      // TODO: Saving
    } else if (action === "preview") {
      // TODO: Preview
    }
  }, []);

  return (
    <div className="max-w-6xl">
      <FormDialog
        open={isDialogOpen}
        onClose={openCancelModal}
        maxWidth={"lg"}
        fullScreen={true}
        aria-labelledby="simple-dialog-title">
        <div className={"w-full xl:w-3/4 max-w-6xl m-auto"}>
          <DialogTitleWithStyles id="customized-dialog-title">
            <div className="flex">
              <div className="flex-1">
                {intl.formatMessage(
                  wizardMessages.esittelijatMuutospyyntoDialogTitle
                )}
              </div>
              <div>
                <SimpleButton
                  text={`${intl.formatMessage(wizardMessages.getOut)} X`}
                  onClick={openCancelModal}
                  variant={"text"}
                />
              </div>
            </div>
          </DialogTitleWithStyles>
        </div>
        <DialogContentWithStyles>
          <div className="bg-vaalenharmaa px-16 w-full xl:w-3/4 max-w-6xl m-auto mb-20 border-b border-xs border-harmaa">
            <div className="py-4">
              <h1>{organisation.nimi[intl.locale || "fi"]}</h1>
              <p>
                {organisation.kayntiosoite.osoite},{" "}
                {organisation.postiosoite.osoite}{" "}
                {organisation.kayntiosoite.postitoimipaikka}
              </p>
              <p>
                {organisationPhoneNumber && (
                  <React.Fragment>
                    <a href={`tel:${organisationPhoneNumber}`}>
                      {organisationPhoneNumber}
                    </a>{" "}
                    |{" "}
                  </React.Fragment>
                )}
                {organisationPhoneNumber && (
                  <React.Fragment>
                    <a href={`mailto:${organisationEmail}`}>
                      {organisationEmail}
                    </a>{" "}
                    |{" "}
                  </React.Fragment>
                )}
                {organisation.ytunnus} |{" "}
                {organisationWebsite && (
                  <a href={organisationWebsite}>{organisationWebsite}</a>
                )}
              </p>
            </div>
          </div>
          <div
            id="wizard-content"
            className="px-16 xl:w-3/4 max-w-6xl m-auto mb-20">
            <EsittelijatMuutospyynto
              kielet={kieletAndOpetuskielet}
              kohteet={kohteet}
              koulutukset={parsedKoulutukset}
              kunnat={kunnat}
              maakuntakunnatList={maakuntakunnatList}
              maakunnat={maakunnat}
              lupa={lupa}
              lupaKohteet={lupaKohteet}
              maaraystyypit={maaraystyypit}
              muut={muut}
              lomakkeet={lomakkeet}
              onChangesUpdate={onSectionChangesUpdate}
              tutkinnot={parsedTutkinnot}
            />
            <EsittelijatWizardActions
              isSavingEnabled={true}
              onClose={openCancelModal}
              onPreview={() => {
                return onAction("preview");
              }}
              onSave={() => {
                return onAction("save");
              }}
            />
          </div>
        </DialogContentWithStyles>
      </FormDialog>
      <ConfirmDialog
        isConfirmDialogVisible={isConfirmDialogVisible}
        title={"Poistutaanko?"}
        content={HAKEMUS_VIESTI.VARMISTUS.FI}
        yesMessage={HAKEMUS_VIESTI.KYLLA.FI}
        noMessage={HAKEMUS_VIESTI.EI.FI}
        handleOk={closeWizard}
        handleCancel={handleCancel}
      />
    </div>
  );
};

UusiAsiaDialog.propTypes = {
  backendMuutokset: PropTypes.array,
  elykeskukset: PropTypes.array,
  history: PropTypes.object,
  koulutustyypit: PropTypes.array,
  kunnat: PropTypes.array,
  lupa: PropTypes.object,
  lupKohteet: PropTypes.object,
  maakunnat: PropTypes.array,
  maakuntakunnat: PropTypes.array,
  maaraystyypit: PropTypes.array,
  muut: PropTypes.array,
  muutosperusteluList: PropTypes.array,
  onNewDocSave: PropTypes.func,
  organisation: PropTypes.object,
  vankilat: PropTypes.array
};

export default UusiAsiaDialog;