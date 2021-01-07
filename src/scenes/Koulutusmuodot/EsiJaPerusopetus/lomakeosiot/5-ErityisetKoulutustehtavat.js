import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import Lomake from "components/02-organisms/Lomake";
import education from "i18n/definitions/education";
import { getAnchorPart } from "utils/common";
import { useChangeObjects } from "stores/muutokset";

const constants = {
  formLocation: ["esiJaPerusopetus", "erityisetKoulutustehtavat"],
  mode: "modification"
};

const ErityisetKoulutustehtavat = ({
  code,
  isPreviewModeOn,
  maaraykset,
  mode = constants.mode,
  rajoitteet,
  sectionId,
  title
}) => {
  const intl = useIntl();
  const [, { createTextBoxChangeObject }] = useChangeObjects();

  const onAddButtonClick = useCallback(
    addBtn => {
      createTextBoxChangeObject(sectionId, getAnchorPart(addBtn.fullAnchor, 1));
    },
    [createTextBoxChangeObject, sectionId]
  );

  return (
    <Lomake
      anchor={sectionId}
      code={code}
      data={{ maaraykset, rajoitteet, sectionId }}
      functions={{
        onAddButtonClick
      }}
      formTitle={title}
      mode={mode}
      isPreviewModeOn={isPreviewModeOn}
      isRowExpanded={true}
      path={constants.formLocation}
      rowTitle={intl.formatMessage(education.erityisetKoulutustehtavat)}
      showCategoryTitles={true}
    ></Lomake>
  );
};

ErityisetKoulutustehtavat.propTypes = {
  code: PropTypes.string,
  isPreviewModeOn: PropTypes.bool,
  maaraykset: PropTypes.array,
  mode: PropTypes.string,
  rajoitteet: PropTypes.object,
  sectionId: PropTypes.string,
  title: PropTypes.string
};

export default ErityisetKoulutustehtavat;