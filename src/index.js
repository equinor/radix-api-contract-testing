import config from 'config';
import express from 'express';
import bodyParser from 'body-parser';

import { name as appName, version as appVersion } from '../package.json';

import { getEnvironemnts } from './utils';
import { makeLogger } from './logger';
import { runPipelineAndUpdateState } from './pipeline';
import webhookHandler from './webhook';
import * as state from './state';

state.init();

const localLog = makeLogger({ component: 'app' });
const app = express();

app.use(bodyParser.text({ type: '*/*' }));

// --- Routing -----------------------------------------------------------------

app.get('/', (_, res) =>
  res.send('<pre>' + JSON.stringify(state.getState(), null, 2) + '</pre>')
);

app.get('/trigger', (_, res) => {
  getEnvironemnts().forEach(env => {
    runPipelineAndUpdateState(env, []);
  });
  res.send('triggered');
});

app.post('/webhook', webhookHandler);

// --- Server startup ----------------------------------------------------------

const port = config.get('port');

app.listen(port, () => {
  localLog(`${appName} ${appVersion} listening on port ${port}`);

  getEnvironemnts().forEach(env => {
    runPipelineAndUpdateState(env);
  });
});
