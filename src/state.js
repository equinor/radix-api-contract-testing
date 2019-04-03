const state = {
  latestTestCount: 0,
  latestTestErrors: null,
  latestTestRunSucceeded: null,
  latestTestRunTimestamp: null,
  testRunStatus: 'Initialising',
};

function updateTestRunState(newState) {
  Object.keys(newState).forEach(key => (state[key] = newState[key]));
  state.latestTestRunTimestamp = parseInt(
    (new Date().getTime() / 1000).toFixed(0)
  );
}

export function testRunSuccess(latestTestCount) {
  updateTestRunState({
    latestTestCount,
    latestTestErrors: null,
    latestTestRunSucceeded: true,
    testRunStatus: 'Waiting',
  });
}

export function testRunFailure(latestTestCount, latestTestErrors) {
  updateTestRunState({
    latestTestCount,
    latestTestErrors,
    latestTestRunSucceeded: false,
    testRunStatus: 'Waiting',
  });
}

export function testRunStart() {
  updateTestRunState({
    testRunStatus: 'Running',
  });
}

export const getState = () => state;
