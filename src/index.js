import config from 'config';
import express from 'express';

import { makeLogger, logLevels } from './logger';
import { name as appName, version as appVersion } from '../package.json';
import * as state from './state';
import runPipeline from './pipeline';

const localLog = makeLogger({ component: 'app' });

async function runPipelineAndUpdateState(env) {
  state.testRunStart();

  try {
    const result = await runPipeline(env);
    if (result.failures.length > 0) {
      state.testRunFailure(result.testCount, result.failures);
    } else {
      state.testRunSuccess(result.testCount);
    }
  } catch (err) {
    state.testRunFailure(0, []);
    localLog({ msg: 'Error executing pipeline', err }, logLevels.error);
  }

  console.log(state.getState());
}

const app = express();
const port = config.get('port');

app.use(express.json());

app.get('/', (req, res) =>
  res.send('<pre>' + JSON.stringify(state.getState(), null, 2) + '</pre>')
);

app.post('/webhook', (req, res) =>
  res.json({
    whatIGot: req.body,
  })
);

app.listen(port, () => {
  localLog(`${appName} ${appVersion} listening on port ${port}`);
  const environment = config.get('environment');
  runPipelineAndUpdateState(environment);
});
