import config from 'config';

import { fetchers, updaters } from './projects';
import { makeLogger, logLevels } from './logger';
import runIntegrationTest from './integration';
import * as state from './state';

const envMapping = config.get('branchEnvMapping');
const localLog = makeLogger({ component: 'pipeline' });

export async function runPipeline(env, changedProjects) {
  const projectsToUpdate = changedProjects || Object.keys(envMapping);
  await Promise.all(projectsToUpdate.map(proj => updaters[proj](env)));

  const webConsoleTestDependencies = await fetchers.webConsole(env);
  const apiSwaggerProps = await fetchers.api(env);

  return runIntegrationTest(
    env,
    apiSwaggerProps,
    webConsoleTestDependencies.testData
  );
}

export async function runPipelineAndUpdateState(env, changedProjects) {
  try {
    state.pipelineRunStart(env);
    const result = await runPipeline(env, changedProjects);

    if (result.failures.length > 0) {
      state.testRunFailure(env, result.testCount, result.failures);
    } else {
      state.testRunSuccess(env, result.testCount);
    }
  } catch (err) {
    state.pipelineRunFailure(env);
    localLog(
      { msg: 'Error executing pipeline', err: err.message || err, env },
      logLevels.error
    );
  }
}
