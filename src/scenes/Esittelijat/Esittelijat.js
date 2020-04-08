import React, { useEffect, useState } from "react";
import { PropTypes } from "prop-types";
import Asiat from "./components/Asiat";
import Asiakirjat from "./components/Asiakirjat";
import { Route, Switch, useLocation } from "react-router-dom";
import * as R from "ramda";
import UusiAsiaDialogContainer from "./UusiAsiaDialogContainer";

const Esittelijat = ({ match, user, history }) => {
  const location = useLocation();
  const [uuid, setUuid] = useState("");

  useEffect(() => {
    const uuid = R.split("uuid=", location.search)[1];
    setUuid(uuid);
  }, [location.search]);

  return (
    <React.Fragment>
      <Switch>
        <Route
          authenticated={!!user}
          exact
          path={`${match.url}`}
          render={() => <Asiat history={history} match={match} user={user} />}
        />
        <Route
          authenticated={!!user}
          exacts
          path={`${match.url}/asiakirjat`}
          render={() => <Asiakirjat history={history} uuid={uuid} />}
        />
        <Route
          authenticated={!!user}
          exacts
          path={`${match.url}/:ytunnus/uusi`}
          render={() => <UusiAsiaDialogContainer />}
        />
      </Switch>
    </React.Fragment>
  );
};

Esittelijat.propTypes = {
  match: PropTypes.object,
  user: PropTypes.object,
  history: PropTypes.object
};

export default Esittelijat;
