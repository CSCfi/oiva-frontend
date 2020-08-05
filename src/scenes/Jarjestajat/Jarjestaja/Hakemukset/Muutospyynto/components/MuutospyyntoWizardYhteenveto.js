import React, { useMemo } from "react";
import FormSection from "../../../../../../components/03-templates/FormSection";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import YhteenvetoYleisetTiedot from "./Yhteenveto/YhteenvetoYleisetTiedot";
import YhteenvetoKooste from "./Yhteenveto/YhteenvetoKooste";
import YhteenvetoLiitteet from "./Yhteenveto/YhteenvetoLiitteet";
import wizard from "../../../../../../i18n/definitions/wizard";
import * as R from "ramda";
import Section from "components/03-templates/Section";

const MuutospyyntoWizardYhteenveto = ({
  changeObjects,
  kielet,
  kohteet,
  koulutukset,
  lupa,
  lupaKohteet,
  maaraystyypit,
  muut,
  muutoshakemus,
  muutosperusteluList,
  onChangesRemove,
  onChangesUpdate,
  opetuskielet,
  tutkinnot
}) => {
  const intl = useIntl();
  const jarjestaja = useMemo(() => {
    const nimi = {
      label: "Nimi",
      value: lupa.jarjestaja.nimi[intl.locale]
    };

    const kayntiosoite = {
      label: "Käyntiosoite",
      value: `${lupa.jarjestaja.kayntiosoite.osoite} ${lupa.jarjestaja.kayntiosoite.postitoimipaikka}`
    };

    const postiosoite = {
      label: "Postiosoite",
      value: `${lupa.jarjestaja.postiosoite.osoite} ${lupa.jarjestaja.postiosoite.postitoimipaikka}`
    };

    const sahkopostiosoite = {
      label: "Sähköpostiosoite",
      value:
        (R.find(R.prop("email"))(lupa.jarjestaja.yhteystiedot) || {}).email ||
        "-"
    };

    const www = {
      label: "WWW-osoite",
      value:
        (R.find(R.prop("www"))(lupa.jarjestaja.yhteystiedot) || {}).www || "-"
    };

    const puhelinnumero = {
      label: "Puhelinnumero",
      value:
        (R.find(R.prop("numero"))(lupa.jarjestaja.yhteystiedot) || {}).numero ||
        "-"
    };

    return {
      nimi,
      kayntiosoite,
      postiosoite,
      puhelinnumero,
      sahkopostiosoite,
      www
    };
  }, [intl.locale, lupa.jarjestaja]);

  const jarjestajaLayout = useMemo(() => {
    return R.values(
      R.mapObjIndexed((obj, key) => {
        return (
          <div className="flex" key={key}>
            <div className="w-1/2 sm:w-1/4 border-b px-6 py-2">{obj.label}</div>
            <div className="w-1/2 sm:w-3/4 bg-white px-6 py-2">{obj.value}</div>
          </div>
        );
      }, jarjestaja)
    );
  }, [jarjestaja]);

  return (
    <React.Fragment>
      <h2 className="my-6">{intl.formatMessage(wizard.pageTitle_4)}</h2>

      <h4 className="my-6">Organisaation tiedot</h4>

      <div className="mb-12">{jarjestajaLayout}</div>

      <Section title={"Hakemuksen yleiset tiedot"} className="my-0">
        <YhteenvetoYleisetTiedot
          changeObjects={{
            yhteenveto: changeObjects.yhteenveto.yleisettiedot
          }}
          onChangesRemove={onChangesRemove}
          onChangesUpdate={onChangesUpdate}
        />
        <YhteenvetoKooste
          changeObjects={changeObjects}
          kielet={kielet}
          kohteet={kohteet}
          koulutukset={koulutukset}
          lupa={lupa}
          lupaKohteet={lupaKohteet}
          maaraystyypit={maaraystyypit}
          muutosperusteluList={muutosperusteluList}
          muut={muut}
          muutoshakemus={muutoshakemus}
          onChangesRemove={onChangesRemove}
          onChangesUpdate={onChangesUpdate}
          opetuskielet={opetuskielet}
          tutkinnot={tutkinnot}></YhteenvetoKooste>
      </Section>

      {/* <FormSection
        id="yhteenveto_hakemuksenLiitteet"
        className="my-0"
        render={_props => (
          <React.Fragment>
            <YhteenvetoLiitteet
              changeObjects={{
                hakemuksenLiitteet: changeObjects.yhteenveto.hakemuksenLiitteet
              }}
              {..._props}
            />
          </React.Fragment>
        )}
        runOnChanges={onChangesUpdate}
      /> */}
    </React.Fragment>
  );
};

MuutospyyntoWizardYhteenveto.propTypes = {
  changeObjects: PropTypes.object,
  kielet: PropTypes.array,
  kohteet: PropTypes.array,
  koulutukset: PropTypes.object,
  maaraystyypit: PropTypes.array,
  muut: PropTypes.array,
  lupa: PropTypes.object,
  lupaKohteet: PropTypes.object,
  muutoshakemus: PropTypes.object,
  muutosperusteluList: PropTypes.array,
  onChangesRemove: PropTypes.func,
  onChangesUpdate: PropTypes.func,
  opetuskielet: PropTypes.array,
  tutkinnot: PropTypes.array
};

export default MuutospyyntoWizardYhteenveto;
