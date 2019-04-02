import { spawn } from 'child_process';
import config from 'config';
import rimraf from 'rimraf';

import {
  getBuiltTestDepsDir,
  getSourceTestDepsDir,
  getWorkspace,
} from './workspace';

const webConsoleRemoteRepo = config.get('webConsoleRepo');

async function deleteLocalRepo(env) {
  console.log('deleting local repo');

  return new Promise((resolve, reject) => {
    rimraf(getWorkspace(env), err => (err ? reject(err) : resolve()));
  });
}

async function clone(branch, to) {
  console.log('cloning', branch, 'to', to);

  const { stdout, stderr } = spawn('git', [
    'clone',
    '--single-branch',
    '--branch',
    branch,
    webConsoleRemoteRepo,
    to,
  ]);

  for await (const data of stdout) {
    console.log(`stdout from the child: ${data}`);
  }

  for await (const data of stderr) {
    console.warn(`stderr from the child: ${data}`);
  }
}

async function buildTestDependencies(env) {
  console.log('building test deps');

  const { stdout, stderr } = spawn('node', [
    './node_modules/.bin/babel',
    '--presets=@babel/preset-env',
    '--out-dir',
    getBuiltTestDepsDir(env),
    getSourceTestDepsDir(env),
  ]);

  for await (const data of stdout) {
    console.log(`stdout from the child: ${data}`);
  }

  for await (const data of stderr) {
    console.warn(`stderr from the child: ${data}`);
  }
}

export default async function updater(env) {
  console.log('updating web console');

  const branchToClone = config.get('branchEnvMapping.webConsole')[env];
  await deleteLocalRepo(env);
  await clone(branchToClone, getWorkspace(env));
  await buildTestDependencies(env);
}
