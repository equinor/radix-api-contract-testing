import { getBuiltTestDepsDir } from './workspace';
import { makeLogger } from '../logger';

const localLog = makeLogger({ component: 'web-console-fetcher' });

const TEST_DEPS_MODULE = 'test-dependencies';

export default async function fetcher(env) {
  localLog({ msg: 'Fetching Web Console test dependencies', env });
  const module = `${getBuiltTestDepsDir(env)}/${TEST_DEPS_MODULE}`;
  delete require.cache[require.resolve(module)];
  return await require(module);
}
