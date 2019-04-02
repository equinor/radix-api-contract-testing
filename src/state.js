const state = {
  lastErrors: null,
  lastResultSucceeded: null,
  lastUpdate: null,
  status: 'Initialising',
};

function updateState(newState) {
  Object.keys(newState).forEach(key => (state[key] = newState[key]));
  state.lastUpdate = parseInt((new Date().getTime() / 1000).toFixed(0));
}

export function success() {
  updateState({
    lastErrors: null,
    lastResultSucceeded: true,
    status: 'Waiting',
  });
}

export function failure(lastErrors) {
  updateState({
    lastErrors,
    lastResultSucceeded: false,
    status: 'Waiting',
  });
}

export function start() {
  updateState({
    status: 'Running',
  });
}

export const getState = () => state;
