import config from 'config';

import { fetchers, updaters } from './projects';
import runIntegrationTest from './integration';

const envMapping = config.get('branchEnvMapping');

export default async function runPipeline(env, changedProjects) {
  const projectsToUpdate = changedProjects || Object.keys(envMapping);
  await Promise.all(projectsToUpdate.map(proj => updaters[proj](env)));

  const webConsoleTestDependencies = await fetchers.webConsole(env);
  const apiSwaggerProps = await fetchers.api(env);

  return runIntegrationTest(
    apiSwaggerProps,
    webConsoleTestDependencies.testData
  );
}
