import { getBaseWorkspaceDir } from '../workspace';

const baseWorkspaceDir = getBaseWorkspaceDir();
const webConsoleLocalRepo = `${baseWorkspaceDir}/web-console-repo`;

export const getWorkspace = env => `${webConsoleLocalRepo}-${env}`;

const BUILT_TEST_DEPS_SUBDIR = '/built-test-deps';

export const getBuiltTestDepsDir = env =>
  getWorkspace(env) + BUILT_TEST_DEPS_SUBDIR;

const SRC_TEST_DEPS_SUBDIR = '/src/models';

export const getSourceTestDepsDir = env =>
  getWorkspace(env) + SRC_TEST_DEPS_SUBDIR;
