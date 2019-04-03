import { checkExact } from 'swagger-proptypes';
import { expect } from 'chai';
import Mocha, { Suite, Test } from 'mocha';

import { makeLogger, logLevels } from './logger';

const integrationLogger = makeLogger({ component: 'integration' });
let globalRunNumber = 0;

function silentReporter(runner) {
  Mocha.reporters.Base.call(this, runner);

  const noop = () => null;

  runner.on('pass', noop);
  runner.on('fail', noop);
  runner.on('end', noop);
}

export const resultTypes = Object.freeze({
  fail: Symbol('FAIL'),
  success: Symbol('INFO'),
  warning: Symbol('WARNING'),
});

export default async function runIntegrationTest(apiProps, sampleModelData) {
  const runNumber = ++globalRunNumber;
  const mochaInstance = new Mocha({ reporter: silentReporter });
  const suite = Suite.create(
    mochaInstance.suite,
    'Data samples must match API schema requirements'
  );

  Object.keys(sampleModelData).forEach(modelType => {
    // Iterate over all data samples for this modelType
    const samples = sampleModelData[modelType];

    samples.forEach((rawSample, idx) => {
      const sample = Object.assign({}, rawSample);
      const description =
        `${modelType} - Sample #${idx} ` + (sample.__testDescription || '');

      delete sample.__testDescription;

      suite.addTest(
        new Test(description, function() {
          // We create a test for each model type, and feed it the data in the
          // samples. The object is then checked against the schema provided by
          // the API (which is provided in the form of an auto-generated PropType
          // structure).
          //
          // If the proptypes check fails, we know that the schema that the API
          // server expects is different from what the web console is expecting
          // (which is encoded in the data samples)

          const fn = () => checkExact(modelType, apiProps[modelType], sample);
          expect(fn).to.not.throw();
        })
      );
    });
  });

  return new Promise(resolve => {
    const failures = [];
    let testCount = 0;

    integrationLogger({ msg: 'Start run', runNumber });

    // const runner = mochaInstance.run(errorCount =>
    //   errorCount ? reject(failures) : resolve()
    // );

    const runner = mochaInstance.run(() => resolve({ failures, testCount }));

    runner.on('test', () => ++testCount);

    runner.on('end', () =>
      integrationLogger({ msg: 'End run', runNumber, testCount })
    );

    runner.on('fail', test => {
      integrationLogger(
        { msg: 'Failed test', runNumber, test: test.title },
        logLevels.warning
      );

      failures.push({ test: test.title, error: test.err.actual });
    });
  });
}
