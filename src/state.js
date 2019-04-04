import { getEnvironemnts } from './utils';

const state = {
  environments: {},
};

function updateTestRunState(env, newState) {
  const envState = state.environments[env];

  Object.keys(newState).forEach(key => (envState[key] = newState[key]));
  envState.latestTestRunTimestamp = new Date().toISOString();
}

export function init() {
  state.environments = {};

  getEnvironemnts().forEach(env => {
    if (!state.environments[env]) {
      state.environments[env] = {
        latestTestCount: 0,
        latestTestErrors: null,
        latestTestRunSucceeded: null,
        latestTestRunTimestamp: null,
        testRunStatus: 'Initialising',
      };
    }
  });
}

export function testRunSuccess(env, latestTestCount) {
  updateTestRunState(env, {
    latestTestCount,
    latestTestErrors: null,
    latestTestRunSucceeded: true,
    testRunStatus: 'Waiting',
  });
}

export function testRunFailure(env, latestTestCount, latestTestErrors) {
  updateTestRunState(env, {
    latestTestCount,
    latestTestErrors,
    latestTestRunSucceeded: false,
    testRunStatus: 'Waiting',
  });
}

export function testRunStart(env) {
  updateTestRunState(env, {
    testRunStatus: 'Running',
  });
}

export const getState = () => state;
