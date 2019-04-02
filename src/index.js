import config from 'config';

import * as state from './state';
import runPipeline from './pipeline';

async function runPipelineAndUpdateState(env) {
  state.start();

  try {
    await runPipeline(env);
    state.success();
  } catch (err) {
    state.failure(err);
  }

  console.log(state.getState());
}

const environment = config.get('environment');
runPipelineAndUpdateState(environment);
