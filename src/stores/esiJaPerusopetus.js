import { createStore, createHook } from "react-sweet-state";
import {
  append,
  assoc,
  assocPath,
  clone,
  dissocPath,
  filter,
  flatten,
  isEmpty,
  length,
  map,
  max,
  prop,
  reduce,
  split,
  startsWith
} from "ramda";
import { getChangeObjByAnchor } from "okm-frontend-components/dist/components/02-organisms/CategorizedListRoot/utils";
import tmpState from "./tempState";
import { getAnchorPart, replaceAnchorPartWith } from "utils/common";

const Store = createStore({
  initialState: tmpState,
  actions: {
    acceptRestriction: (sectionId, restrictionId, targetSectionId) => ({
      getState,
      setState
    }) => {
      const currentChangeObjects = prop("changeObjects", getState());
      const nextChangeObjects = map(changeObj => {
        console.info(changeObj, targetSectionId);
        return {
          ...changeObj,
          anchor: replaceAnchorPartWith(changeObj.anchor, 0, targetSectionId)
        };
      }, currentChangeObjects[sectionId]);
      setState(
        assocPath(
          ["changeObjects", targetSectionId],
          nextChangeObjects,
          getState()
        )
      );
    },
    addCriterion: (sectionId, rajoiteId) => ({ getState, setState }) => {
      const currentChangeObjects = prop("changeObjects", getState());
      const rajoitekriteeritChangeObjects = filter(
        changeObj =>
          startsWith(`${sectionId}.${rajoiteId}.kriteerit`, changeObj.anchor),
        currentChangeObjects[sectionId] || []
      );

      /**
       * Etsitään suurin käytössä oleva kriteerin numero ja muodostetaan seuraava
       * numero lisäämällä lukuun yksi.
       */
      const nextCriterionAnchorPart =
        length(rajoitekriteeritChangeObjects) > 0
          ? reduce(
              max,
              -Infinity,
              map(changeObj => {
                return parseInt(getAnchorPart(changeObj.anchor, 3), 10);
              }, rajoitekriteeritChangeObjects)
            ) + 1
          : 0;

      /**
       * Luodaan
       */
      const nextChangeObjects = assoc(
        sectionId,
        append(
          {
            anchor: `${sectionId}.${rajoiteId}.kriteerit.${nextCriterionAnchorPart}.valintaelementti.autocomplete`,
            properties: {
              value: { label: "Määräaika", value: "maaraaika" }
            }
          },
          currentChangeObjects[sectionId] || []
        ),
        currentChangeObjects
      );
      setState({ ...getState(), changeObjects: nextChangeObjects });
    },
    addAClick: (sectionId, anchor) => ({ getState, setState }) => {
      if (sectionId && anchor) {
        const currentChangeObjects = getState().changeObjects[sectionId];
        let nextChangeObjects = clone(currentChangeObjects);
        let changeObj = getChangeObjByAnchor(
          anchor,
          getState().changeObjects[sectionId]
        );
        if (changeObj) {
          nextChangeObjects = filter(changeObj => {
            return changeObj.anchor !== anchor;
          }, currentChangeObjects);
          changeObj = assocPath(
            ["properties", "amountOfClicks"],
            changeObj.properties.amountOfClicks + 1,
            changeObj
          );
        } else {
          changeObj = {
            anchor: anchor,
            properties: {
              amountOfClicks: 1
            }
          };
        }
        const path = flatten(["changeObjects", split("_", sectionId)]);
        setState(
          assocPath(path, flatten([nextChangeObjects, changeObj]), getState())
        );
      }
    },
    closeRestrictionDialog: () => ({ getState, setState }) => {
      setState({ ...getState(), isRestrictionDialogVisible: false });
    },
    removeCriterion: (sectionId, anchor) => ({ getState, setState }) => {
      const currentChangeObjects = prop("changeObjects", getState());
      const nextChangeObjects = filter(changeObj => {
        const criterionAnchor = getAnchorPart(changeObj.anchor, 3);
        return criterionAnchor !== anchor;
      }, currentChangeObjects[sectionId]);
      setState(
        assocPath(["changeObjects", sectionId], nextChangeObjects, getState())
      );
    },
    setChangeObjects: (sectionId, changeObjects) => ({
      getState,
      setState
    }) => {
      if (sectionId && changeObjects) {
        const path = flatten(["changeObjects", split("_", sectionId)]);
        setState(assocPath(path, changeObjects, getState()));
      }
      // Properties not including Toimintaalue and Tutkintokielet are deleted if empty.
      if (
        sectionId &&
        sectionId !== "toimintaalue" &&
        sectionId !== "kielet_tutkintokielet" &&
        isEmpty(changeObjects)
      ) {
        setState(dissocPath(split("_", sectionId), getState().changeObjects));
      }
    },
    showNewRestrictionDialog: () => ({ getState, setState }) => {
      setState({ ...getState(), isRestrictionDialogVisible: true });
    }
  },
  name: "Esi- ja perusopetus"
});

export const useEsiJaPerusopetus = createHook(Store);
