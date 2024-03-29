import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import CategorizedListRoot from "../CategorizedListRoot";
import { getLomake } from "../../../services/lomakkeet";
import { useIntl } from "react-intl";
import ExpandableRowRoot from "../ExpandableRowRoot";
import common from "i18n/definitions/common";
import { has, isEmpty, length, omit } from "ramda";
import { useLomakedata } from "stores/lomakedata";
import { getReducedStructure } from "../CategorizedListRoot/utils";
import FormTitle from "components/00-atoms/FormTitle";
import { getReducedStructureIncludingChanges } from "./utils";
import equal from "react-fast-compare";
import { useChangeObjects } from "stores/muutokset";

const defaultProps = {
  changeObjects: [],
  data: {},
  functions: {},
  isInExpandableRow: true,
  isPreviewModeOn: false,
  isReadOnly: false,
  isRowExpanded: false,
  noPadding: false,
  isSavingState: true,
  prefix: "",
  rowMessages: {},
  rowTitle: "",
  showCategoryTitles: true,
  showValidationErrors: true,
  uncheckParentWithoutActiveChildNodes: false
};

const Lomake = React.memo(
  ({
    anchor,
    changeObjects = defaultProps.changeObjects,
    code,
    data = defaultProps.data,
    formTitle,
    functions = defaultProps.functions,
    isInExpandableRow = defaultProps.isInExpandableRow,
    isPreviewModeOn = defaultProps.isPreviewModeOn,
    isReadOnly = defaultProps.isReadOnly,
    isRowExpanded = defaultProps.isRowExpanded,
    isSavingState = defaultProps.isSavingState,
    lomakedataAnchor,
    mode,
    path: _path,
    prefix = defaultProps.prefix,
    showCategoryTitles = defaultProps.showCategoryTitles,
    uncheckParentWithoutActiveChildNodes = defaultProps.uncheckParentWithoutActiveChildNodes,
    noPadding = defaultProps.noPadding,
    rowMessages = defaultProps.rowMessages,
    rowTitle = defaultProps.rowTitle,
    showValidationErrors = defaultProps.showValidationErrors
  }) => {
    const intl = useIntl();

    const rowLocalizations = isEmpty(rowMessages)
      ? {
          undo: intl.formatMessage(common.undo),
          changesTest: intl.formatMessage(common.changesText)
        }
      : rowMessages;

    const [{ focusOn }, { setFocusOn, setChanges }] = useChangeObjects();

    const [, lomakedataActions] = useLomakedata({
      anchor: lomakedataAnchor || anchor
    });

    const [lomake, setLomake] = useState();

    const onChangesRemove = useCallback(
      anchor => {
        setChanges([], anchor);
      },
      [setChanges]
    );

    const onChangesUpdate = useCallback(
      ({ anchor, changes }) => {
        setChanges(changes, anchor);
      },
      [setChanges]
    );

    const onFocus = useCallback(
      (anchor = null) => {
        setFocusOn(anchor);
      },
      [setFocusOn]
    );

    useEffect(() => {
      (async () => {
        async function fetchLomake(_mode, _changeObjects, _data, _functions) {
          return await getLomake(
            _mode || mode,
            _changeObjects || changeObjects,
            _data || data,
            _functions || functions,
            { isPreviewModeOn, isReadOnly },
            intl.locale,
            _path,
            prefix
          );
        }

        const juuriHaettuLomake = await fetchLomake();
        const lomakerakenne = juuriHaettuLomake.structure || juuriHaettuLomake;

        const lomakedata =
          lomakerakenne && lomakerakenne.length
            ? getReducedStructureIncludingChanges(
                lomakedataAnchor || anchor,
                getReducedStructure(lomakerakenne),
                changeObjects
              )
            : [];

        /**
         * Osa lomakkeista voi olla sellaisia, että niiden tilan
         * tallentaminen aiheuttaa liikaa uudelleen lataamisia.
         * Esimerkkinä tällaisesta lomakkeesta on rajoitelomake.
         * Rajoitelomake hyödyntää lomakedataa ja näin ollen
         * päivittyy datan päivittyessä. Jos rajoitelomakkeen
         * dataa tallennetaan samaan paikkaan, kuin muiden
         * lomakkeiden, aiheutuu siitä ikiluuppi.
         */
        if (isSavingState) {
          lomakedataActions.setLomakedata(lomakedata, anchor);
        }
        /**
         * Esikatselulomake tarvitsee lomakerakenteen luontia varten
         * muokkaustilaisen lomakkeen nykytilan.
         */
        if (isPreviewModeOn) {
          const previewLomake = await fetchLomake("preview", [], {
            ...data,
            lomakedata
          });
          setLomake(previewLomake.structure || previewLomake);
        } else {
          if (has("isValid", juuriHaettuLomake)) {
            lomakedataActions.setValidity(juuriHaettuLomake.isValid, anchor);
          }

          setLomake(lomakerakenne);
        }
      })();
    }, [
      _path,
      anchor,
      changeObjects,
      data,
      functions,
      intl.locale,
      isPreviewModeOn,
      isReadOnly,
      isSavingState,
      lomakedataActions,
      lomakedataAnchor,
      mode,
      prefix
    ]);

    if (Array.isArray(lomake) && lomake.length) {
      return (
        <div className="pt-8">
          {code || formTitle ? (
            <FormTitle
              code={isPreviewModeOn || !code ? null : code}
              isPreviewModeOn={isPreviewModeOn}
              level={isPreviewModeOn ? 3 : 2}
              title={formTitle}
            />
          ) : null}
          {isInExpandableRow &&
          !isPreviewModeOn &&
          (mode !== "reasoning" || length(changeObjects)) ? (
            <ExpandableRowRoot
              anchor={anchor}
              changes={changeObjects}
              key={`expandable-row-root`}
              hideAmountOfChanges={true}
              isExpanded={isRowExpanded}
              onChangesRemove={onChangesRemove}
              messages={rowLocalizations}
              sectionId={anchor}
              title={rowTitle}
            >
              <div className={noPadding ? "" : "p-8"}>
                <CategorizedListRoot
                  anchor={anchor}
                  focusOn={focusOn}
                  categories={lomake}
                  changes={changeObjects}
                  isReadOnly={isReadOnly}
                  onFocus={onFocus}
                  onUpdate={onChangesUpdate}
                  showCategoryTitles={showCategoryTitles}
                  showValidationErrors={showValidationErrors}
                  uncheckParentWithoutActiveChildNodes={
                    uncheckParentWithoutActiveChildNodes
                  }
                />
              </div>
            </ExpandableRowRoot>
          ) : mode !== "reasoning" || length(changeObjects) ? (
            <CategorizedListRoot
              anchor={anchor}
              focusOn={focusOn}
              categories={lomake}
              isPreviewModeOn={isPreviewModeOn}
              isReadOnly={isReadOnly}
              changes={changeObjects}
              onFocus={onFocus}
              onUpdate={onChangesUpdate}
              showCategoryTitles={showCategoryTitles}
              showValidationErrors={showValidationErrors}
              uncheckParentWithoutActiveChildNodes={
                uncheckParentWithoutActiveChildNodes
              }
            />
          ) : null}
        </div>
      );
    } else {
      return null;
    }
  },
  (cp, np) => {
    return equal(omit(["functions"], cp), omit(["functions"], np));
  }
);

Lomake.propTypes = {
  anchor: PropTypes.string,
  code: PropTypes.string,
  data: PropTypes.object,
  functions: PropTypes.object,
  isInExpandableRow: PropTypes.bool,
  isPreviewModeOn: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isRowExpanded: PropTypes.bool,
  lomakedataAnchor: PropTypes.string,
  mode: PropTypes.string,
  path: PropTypes.array,
  prefix: PropTypes.string,
  rowMessages: PropTypes.object,
  rowTitle: PropTypes.string,
  isSavingState: PropTypes.bool,
  uncheckParentWithoutActiveChildNodes: PropTypes.bool
};

export default Lomake;
