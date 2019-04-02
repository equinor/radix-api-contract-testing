import { getBuiltTestDepsDir } from './workspace';

const TEST_DEPS_MODULE = 'test-dependencies';

export default async function fetcher(env) {
  console.log('fetching web console test dependencies');

  return await require(`${getBuiltTestDepsDir(env)}/${TEST_DEPS_MODULE}`);
}
