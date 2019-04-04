import process from 'process';

const pid = process.pid;

export const logLevels = Object.freeze({
  error: Symbol('ERROR'),
  info: Symbol('INFO'),
  warning: Symbol('WARNING'),
});

const logLevelValues = Object.values(logLevels);

const log = (whatToLog, level = logLevels.info) => {
  if (!logLevelValues.includes(level)) {
    throw `Cannot log with level "${level.toString()}"`;
  }

  const logObj = typeof whatToLog === 'object' ? whatToLog : { msg: whatToLog };

  console.log(
    JSON.stringify({
      level: level.description,
      pid,
      datetime: new Date().toISOString(),
      ...logObj,
    })
  );
};

export const makeLogger = (frontLoad = {}) => (whatToLog, level) => {
  const logObj = typeof whatToLog === 'object' ? whatToLog : { msg: whatToLog };
  log({ ...frontLoad, ...logObj }, level);
};

export default log;
