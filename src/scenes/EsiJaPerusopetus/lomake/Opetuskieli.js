import React from "react";
import ExpandableRowRoot from "okm-frontend-components/dist/components/02-organisms/ExpandableRowRoot";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import Lomake from "../../../components/02-organisms/Lomake";
import common from "../../../i18n/definitions/common";
import { equals, toUpper } from "ramda";

const Opetuskieli = React.memo(
  ({ changeObjects, onChangesRemove, onChangesUpdate, kieletOPH }) => {
    const intl = useIntl();
    const sectionId = "opetuskieli";

    const changesMessages = {
      undo: intl.formatMessage(common.undo),
      changesTest: intl.formatMessage(common.changesText)
    };

    return (
      <ExpandableRowRoot
        anchor={sectionId}
        key={`expandable-row-root`}
        changes={changeObjects}
        hideAmountOfChanges={true}
        isExpanded={true}
        messages={changesMessages}
        onChangesRemove={onChangesRemove}
        onUpdate={onChangesUpdate}
        sectionId={sectionId}
        showCategoryTitles={true}
        title={"Kielet"}>
        <Lomake
          action="modification"
          anchor={sectionId}
          changeObjects={changeObjects}
          data={{
            kieletOPH
          }}
          onChangesUpdate={onChangesUpdate}
          path={["esiJaPerusopetus", "opetuskielet"]}
          showCategoryTitles={true}></Lomake>
      </ExpandableRowRoot>
    );
  },
  (currentProps, nextProps) => {
    return equals(currentProps.changeObjects, nextProps.changeObjects);
  }
);

Opetuskieli.propTypes = {
  changeObjects: PropTypes.array,
  onChangesUpdate: PropTypes.func,
  kieletOPH: PropTypes.array
};

export default Opetuskieli;