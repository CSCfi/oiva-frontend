import React, { useState } from "react";
import PropTypes from "prop-types";
import ExpandableRow from "./ExpandableRow";
import CategorizedListRoot from "../CategorizedListRoot";
import NumberOfChanges from "../../00-atoms/NumberOfChanges";
import { makeStyles } from "@material-ui/core/styles";
import UndoIcon from "@material-ui/icons/Undo";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import { compose, filter, not, pathEq } from "ramda";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  noPadding: {
    padding: 0
  }
}));

const defaultProps = {
  categories: [],
  changes: [],
  disableReverting: false,
  hideAmountOfChanges: false,
  isExpanded: false,
  messages: {
    undo: "Undo",
    changesText: "Muutokset:"
  },
  showCategoryTitles: false
};

const ExpandableRowRoot = ({
  anchor,
  categories = defaultProps.categories,
  changes = defaultProps.changes,
  children,
  code,
  disableReverting = defaultProps.disableReverting,
  hideAmountOfChanges = defaultProps.hideAmountOfChanges,
  index,
  isExpanded = defaultProps.isExpanded,
  messages = defaultProps.messages,
  onChangesRemove,
  onUpdate,
  sectionId,
  showCategoryTitles = defaultProps.showCategoryTitles,
  title,
  isReadOnly,
  showValidationErrors
}) => {
  const classes = useStyles();
  const [isToggledOpen, setIsToggleOpen] = useState(false);

  const onToggle = (...props) => {
    setIsToggleOpen(props[1]);
  };

  const amountOfRelevantChanges = filter(
    compose(not, pathEq(["properties", "metadata", "isOnlyForUI"], true)),
    changes
  );

  return (
    <React.Fragment>
      {categories && (
        <ExpandableRow
          shouldBeExpanded={isExpanded}
          onToggle={onToggle}
          id={anchor}
        >
          <Typography
            component="h4"
            variant="h4"
            classes={{ root: classes.noPadding }}
            data-slot="title"
          >
            {code && <span className="pr-6">{code}</span>}
            <span>{title}</span>
          </Typography>
          <div data-slot="info">
            {amountOfRelevantChanges.length > 0 && (
              <div className="flex items-center">
                {!hideAmountOfChanges && (
                  <NumberOfChanges
                    changes={amountOfRelevantChanges}
                    id={anchor}
                    messages={messages}
                  />
                )}
                {!disableReverting && (
                  <span className="mx-6">
                    <Tooltip title={messages.undo}>
                      <Button
                        component="span"
                        color="primary"
                        className={classes.noPadding}
                        endIcon={<UndoIcon />}
                        onClick={e => {
                          e.stopPropagation();
                          return onChangesRemove(sectionId, anchor, index);
                        }}
                        size="small"
                      >
                        {messages.undo}
                      </Button>
                    </Tooltip>
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            data-slot="content"
            className={`w-full ${!children ? "p-8" : ""}`}
          >
            {!children && (isExpanded || isToggledOpen) ? (
              <CategorizedListRoot
                anchor={anchor}
                categories={categories}
                changes={changes}
                index={index}
                onUpdate={onUpdate}
                sectionId={sectionId}
                showCategoryTitles={showCategoryTitles}
                isReadOnly={isReadOnly}
                showValidationErrors={showValidationErrors}
              />
            ) : (
              children
            )}
          </div>
        </ExpandableRow>
      )}
    </React.Fragment>
  );
};

ExpandableRowRoot.propTypes = {
  anchor: PropTypes.string,
  categories: PropTypes.array,
  changes: PropTypes.array,
  code: PropTypes.string,
  disableReverting: PropTypes.bool,
  hideAmountOfChanges: PropTypes.bool,
  index: PropTypes.number,
  isExpanded: PropTypes.bool,
  messages: PropTypes.object,
  onChangesRemove: PropTypes.func,
  onUpdate: PropTypes.func,
  sectionId: PropTypes.string,
  showCategoryTitles: PropTypes.bool,
  title: PropTypes.string,
  isReadOnly: PropTypes.bool,
  showValidationErrors: PropTypes.bool
};

export default ExpandableRowRoot;
