import fs from 'fs';
import config from 'config';
import fetch from 'node-fetch';

import { getWorkspace, getDefsFilePath } from './workspace';
import { makeLogger } from '../logger';

const API_DOMAIN = 'server-radix-api';
const API_SWAGGER_PATH = '/swaggerui/swagger.json';

const localLog = makeLogger({ component: 'api-fetcher' });

const getDomain = () =>
  [config.get('apiClusterName'), config.get('apiClusterDomain')].join('.');

function writeFile(path, data, opts = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, opts, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default async function updater(env) {
  const url = `https://${API_DOMAIN}-${env}.${getDomain()}${API_SWAGGER_PATH}`;
  localLog({ msg: 'Retrieving Swagger defs', url });

  const defsResource = await fetch(url);

  if (defsResource.status !== 200) {
    throw `API Swagger defs returned status ${defsResource.status}`;
  }

  const defsText = await defsResource.text();

  const dir = getWorkspace(env);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = getDefsFilePath(env);
  localLog({ msg: 'Saving Swagger defs', filePath });
  await writeFile(filePath, defsText);
}
