import config from 'config';

export function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

export function getEnvironemnts() {
  const projects = config.get('branchEnvMapping');
  const envs = [];

  Object.keys(projects).forEach(projectName =>
    Object.keys(projects[projectName]).forEach(env => envs.push(env))
  );

  return [...new Set(envs)];
}
