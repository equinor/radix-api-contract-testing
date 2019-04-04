import config from 'config';
import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';

import { name as appName, version as appVersion } from '../package.json';

import { getKeyByValue } from './utils';
import { makeLogger, logLevels } from './logger';
import * as state from './state';
import runPipeline from './pipeline';

const localLog = makeLogger({ component: 'app' });
const branchEnvMapping = config.get('branchEnvMapping');

async function runPipelineAndUpdateState(env, changedProjects) {
  state.testRunStart();

  try {
    const result = await runPipeline(env, changedProjects);

    if (result.failures.length > 0) {
      state.testRunFailure(result.testCount, result.failures);
    } else {
      state.testRunSuccess(result.testCount);
    }
  } catch (err) {
    state.testRunFailure(0);
    localLog(
      { msg: 'Error executing pipeline', err: err.message },
      logLevels.error
    );
  }

  console.log(state.getState());
}

const app = express();
const port = config.get('port');

app.use(bodyParser.text({ type: '*/*' }));

app.get('/', (_, res) =>
  res.send('<pre>' + JSON.stringify(state.getState(), null, 2) + '</pre>')
);

app.get('/trigger', (_, res) => {
  runPipelineAndUpdateState(config.get('environment'), []);
  res.send('triggered');
});

app.post('/webhook', (req, res) => {
  const body = req.body;
  const givenSignature = req.header('X-Hub-Signature');
  const bodyHash = crypto
    .createHmac('sha1', config.get('githubSharedSecret'))
    .update(body)
    .digest('hex');
  const expectedSignature = `sha1=${bodyHash}`;

  if (expectedSignature !== givenSignature) {
    localLog({ msg: 'Invalid webhook signature' }, logLevels.warning);
    return res.status(401).send('Invalid signature');
  }

  const json = JSON.parse(body);
  const branch = json.ref.split('/').pop();
  const repo = json.repository.full_name;
  let env;

  switch (repo) {
    case config.get('apiRepo'):
      env = getKeyByValue(branchEnvMapping.api, branch);
      runPipelineAndUpdateState(env, ['api']);
      return res.send(200).send('Integration test started');

    case config.get('webConsoleRepo'):
      env = getKeyByValue(branchEnvMapping.webConsole, branch);
      runPipelineAndUpdateState(environmentFromBranch, ['webConsole']);
      return res.status(200).send('Integration test started');

    default:
      return res
        .status(202)
        .send(`Build not triggered for branch "${branch}" on repo "${repo}"`);
  }
});

app.listen(port, () => {
  localLog(`${appName} ${appVersion} listening on port ${port}`);
  runPipelineAndUpdateState(config.get('environment'));
});
