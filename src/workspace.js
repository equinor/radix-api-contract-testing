import config from 'config';
import path from 'path';

const appDir = path.dirname(path.dirname(require.main.filename));
const workspaceDir = config.get('workspaceDir');

export const getBaseWorkspaceDir = () => `${appDir}/${workspaceDir}`;
