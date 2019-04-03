import { getBuiltTestDepsDir } from './workspace';
import { makeLogger } from '../logger';

const localLog = makeLogger({ component: 'web-console-fetcher' });

const TEST_DEPS_MODULE = 'test-dependencies';

export default async function fetcher(env) {
  localLog('Fetching Web Console test dependencies');
  return await require(`${getBuiltTestDepsDir(env)}/${TEST_DEPS_MODULE}`);
}
