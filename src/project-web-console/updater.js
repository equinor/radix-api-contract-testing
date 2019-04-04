import { spawn } from 'child_process';
import config from 'config';
import rimraf from 'rimraf';

import {
  getBuiltTestDepsDir,
  getSourceTestDepsDir,
  getWorkspace,
} from './workspace';
import { makeLogger } from '../logger';

const localLog = makeLogger({ component: 'web-console-updater' });
const webConsoleRemoteRepo =
  'git@github.com:' + config.get('webConsoleRepo') + '.git';

async function deleteLocalRepo(env) {
  localLog('Deleting local repo');

  return new Promise((resolve, reject) => {
    rimraf(getWorkspace(env), err => (err ? reject(err) : resolve()));
  });
}

async function clone(branch, to) {
  localLog({ msg: 'Cloning remote repo', branch, to });

  const { stdout, stderr } = spawn('git', [
    'clone',
    '--single-branch',
    '--branch',
    branch,
    webConsoleRemoteRepo,
    to,
  ]);

  for await (const buf of stdout) {
    localLog({ msg: 'Clone process stdout', data: buf.toString('utf8') });
  }

  for await (const buf of stderr) {
    localLog({ msg: 'Clone process stderr', data: buf.toString('utf8') });
  }
}

async function buildTestDependencies(env) {
  localLog('Building test deps');

  const { stdout, stderr } = spawn('node', [
    './node_modules/.bin/babel',
    '--presets=@babel/preset-env',
    '--out-dir',
    getBuiltTestDepsDir(env),
    getSourceTestDepsDir(env),
  ]);

  for await (const buf of stdout) {
    localLog({ msg: 'Build process stdout', data: buf.toString('utf8') });
  }

  for await (const buf of stderr) {
    localLog({ msg: 'Build process stderr', data: buf.toString('utf8') });
  }
}

export default async function updater(env) {
  localLog('Updating Web Console');

  const branchToClone = config.get('branchEnvMapping.webConsole')[env];
  await deleteLocalRepo(env);
  await clone(branchToClone, getWorkspace(env));
  await buildTestDependencies(env);
}
