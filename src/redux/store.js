import {createStore} from 'redux';

// Initial state
const initialState = {
  username: '',
  leaderboard: [],
};

// Actions
const SET_USERNAME = 'SET_USERNAME';
const SET_LEADERBOARD = 'SET_LEADERBOARD';

// Reducer function
function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        username: action.payload,
      };
    case SET_LEADERBOARD:
      return {
        ...state,
        leaderboard: action.payload,
      };
    default:
      return state;
  }
}

// Action Creators
export const setUsername = username => ({
  type: SET_USERNAME,
  payload: username,
});

export const setLeaderboard = leaderboard => ({
  type: SET_LEADERBOARD,
  payload: leaderboard,
});

// Create the Redux store
const store = createStore(rootReducer);

export default store;
