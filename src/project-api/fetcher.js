import { propsFromDefs } from 'swagger-proptypes';

import config from 'config';
import fetch from 'node-fetch';

const API_DOMAIN = 'server-radix-api';
const API_SWAGGER_PATH = '/swaggerui/swagger.json';

const getDomain = () =>
  [config.get('apiClusterName'), config.get('apiClusterDomain')].join('.');

export default async function fetcher(env) {
  // TODO: Move this to the update file and return cached results

  console.log('fetching api test dependencies');

  const url = `https://${API_DOMAIN}-${env}.${getDomain()}${API_SWAGGER_PATH}`;
  console.log(`Retrieving Swagger defs from ${url}`);

  const defs = await fetch(url).then(res => res.json());
  return propsFromDefs(defs.definitions);
}
