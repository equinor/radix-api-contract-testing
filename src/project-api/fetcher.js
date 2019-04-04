import { propsFromDefs } from 'swagger-proptypes';
import fs from 'fs';

import { getDefsFilePath } from './workspace';
import { makeLogger } from '../logger';

const localLog = makeLogger({ component: 'api-fetcher' });

const readFile = (path, opts = 'utf8') =>
  new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

export default async function fetcher(env) {
  const filePath = getDefsFilePath(env);
  localLog({ msg: 'Opening API defs file', filePath });

  const defs = await readFile(filePath);
  const jsonDefs = JSON.parse(defs);
  return propsFromDefs(jsonDefs.definitions);
}
