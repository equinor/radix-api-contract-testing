import { getBaseWorkspaceDir } from '../workspace';

const baseWorkspaceDir = getBaseWorkspaceDir();
const apiDefsDir = `${baseWorkspaceDir}/api-defs`;
const DEFS_FILENAME = 'swagger-defs.json';

export const getWorkspace = env => `${apiDefsDir}-${env}`;

export const getDefsFilePath = env => `${getWorkspace(env)}/${DEFS_FILENAME}`;
