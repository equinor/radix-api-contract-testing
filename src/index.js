import config from 'config';
import express from 'express';

import { makeLogger } from './logger';
import { name as appName, version as appVersion } from '../package.json';
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

const appLogger = makeLogger({ component: 'app' });

const app = express();
const port = config.get('port');

app.get('/', (req, res) => res.send('<pre>' + JSON.stringify(state.getState(), null, 2) + '</pre>'));

app.listen(port, () => {
  appLogger(`${appName} ${appVersion} listening on port ${port}`);
  const environment = config.get('environment');
  runPipelineAndUpdateState(environment);
});
