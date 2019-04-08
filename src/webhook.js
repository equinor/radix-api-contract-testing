import config from 'config';
import crypto from 'crypto';

import { getKeyByValue } from './utils';
import { makeLogger, logLevels } from './logger';
import { runPipelineAndUpdateState } from './pipeline';

const localLog = makeLogger({ component: 'webhook' });
const branchEnvMapping = config.get('branchEnvMapping');

function validateSignature(req) {
  const givenSignature = req.header('X-Hub-Signature');
  const bodyHash = crypto
    .createHmac('sha1', config.get('githubSharedSecret'))
    .update(req.body)
    .digest('hex');
  const expectedSignature = `sha1=${bodyHash}`;

  return expectedSignature === givenSignature;
}

function startIntergationTest(project, branch, res) {
  const env = getKeyByValue(branchEnvMapping[project], branch);

  if (!env) {
    const msg = 'Build not triggered for unmapped branch';
    localLog({ msg, project, branch }, logLevels.warning);
    return res.status(202).send(`${msg}, branch ${branch}, project ${project}`);
  }

  const msg = 'Integration test started';
  localLog({ msg, project, branch, env });
  runPipelineAndUpdateState(env, [project]);
  return res.status(200).send(`${msg}, branch ${branch}, environment ${env}`);
}

export default function webhookHandler(req, res) {
  if (!validateSignature(req)) {
    localLog('Invalid webhook signature', logLevels.warning);
    return res.status(401).send('Invalid signature');
  }

  if (req.header('X-GitHub-Event') === 'ping') {
    localLog('Ping successful');
    return res.status(200).send('Ping successful');
  }

  let json;
  let branch;
  let repo;

  try {
    json = JSON.parse(req.body);
    branch = json.ref.split('/').pop();
    repo = json.repository.full_name;
  } catch (err) {
    localLog({ msg: 'Invalid webhook content', err }, logLevels.error);
    return res.status(400).send('Invalid content');
  }

  switch (repo) {
    case config.get('apiRepo'):
      return startIntergationTest('api', branch, res);

    case config.get('webConsoleRepo'):
      return startIntergationTest('webConsole', branch, res);

    default:
      localLog({ msg: 'Build not triggered', branch, repo }, logLevels.warning);
      return res
        .status(202)
        .send(`Build not triggered for branch "${branch}" on repo "${repo}"`);
  }
}
