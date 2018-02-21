import { combineReducers } from 'redux'
import luvatReducer from 'routes/Jarjestajat/modules/luvat'
import lupaReducer from 'routes/Jarjestajat/Jarjestaja/modules/lupa'
import historyReducer from 'routes/Jarjestajat/Jarjestaja/modules/history'
import userReducer from 'routes/Login/modules/user'
import muutospyynnotReducer from '../routes/Jarjestajat/Jarjestaja/Hakemukset/modules/muutospyynnot'
import { reducer as reduxFormReducer } from 'redux-form';

const rootReducer = combineReducers({
  luvat: luvatReducer,
  lupa: lupaReducer,
  lupaHistory: historyReducer,
  user: userReducer,
  muutospyynnot: muutospyynnotReducer,
  form: reduxFormReducer
})

export default rootReducer
