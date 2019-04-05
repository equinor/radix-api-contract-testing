import eev from 'eev';

import { getEnvironemnts } from './utils';

const state = {
  environments: {},
};

function updateEnvState(env, newState) {
  const envState = state.environments[env];

  Object.keys(newState).forEach(key => (envState[key] = newState[key]));
  envState.latestTestRunTimestamp = new Date().toISOString();

  stateEvents.emit('change', state);
}

export const stateEvents = new eev();

export function init() {
  state.environments = {};

  getEnvironemnts().forEach(env => {
    if (!state.environments[env]) {
      state.environments[env] = {
        latestTestCount: 0,
        latestTestErrors: null,
        latestTestRunSucceeded: null,
        latestTestRunTimestamp: null,
        pipelineSucceeded: null,
        testRunStatus: 'initialising',
      };
    }
  });
}

export function testRunSuccess(env, latestTestCount) {
  updateEnvState(env, {
    latestTestCount,
    latestTestErrors: null,
    latestTestRunSucceeded: true,
    pipelineSucceeded: true,
    testRunStatus: 'waiting',
  });
}

export function testRunFailure(env, latestTestCount, latestTestErrors) {
  updateEnvState(env, {
    latestTestCount,
    latestTestErrors,
    latestTestRunSucceeded: false,
    pipelineSucceeded: true,
    testRunStatus: 'waiting',
  });
}

export function pipelineRunStart(env) {
  updateEnvState(env, {
    testRunStatus: 'running',
  });
}

export function pipelineRunFailure(env) {
  updateEnvState(env, {
    testRunStatus: 'waiting',
    pipelineSucceeded: false,
  });
}

export const getState = () => state;
