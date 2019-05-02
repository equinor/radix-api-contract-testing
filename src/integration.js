import { checkExact } from 'swagger-proptypes';

import { makeLogger, logLevels } from './logger';

const localLog = makeLogger({ component: 'integration' });
let globalRunNumber = 0;

export default function runIntegrationTest(env, apiProps, sampleModelData) {
  const runNumber = ++globalRunNumber;
  const failures = [];
  let testCount = 0;

  localLog({ msg: 'Start run', runNumber, env });

  Object.keys(sampleModelData).forEach(modelType => {
    // Iterate over all data samples for this modelType
    const samples = sampleModelData[modelType];

    samples.forEach((rawSample, sampleNumber) => {
      const sample = Object.assign({}, rawSample);
      const testDescription = sample.__testDescription;
      const shouldFail = !!sample.__testShouldFail;

      delete sample.__testDescription;
      delete sample.__testShouldFail;

      ++testCount;

      // We create a test for each model type, and feed it the data in the
      // samples. The object is then checked against the schema provided by
      // the API (which is provided in the form of an auto-generated PropType
      // structure).
      //
      // If the proptypes check fails, we know that the schema that the API
      // server expects is different from what the web console is expecting
      // (which is encoded in the data samples)

      const testErrors = checkExact(modelType, apiProps[modelType], sample);

      if (shouldFail && testErrors.length === 0) {
        localLog(
          {
            msg: 'Failed test (should not pass but did)',
            runNumber,
            modelType,
            sampleNumber,
            testDescription,
            propFailures: testErrors.length,
            env,
          },
          logLevels.warning
        );

        failures.push({
          test: testDescription,
          error: 'The test should not have passed',
        });
      } else if (!shouldFail && testErrors.length > 0) {
        localLog(
          {
            msg: 'Failed test',
            runNumber,
            modelType,
            sampleNumber,
            testDescription,
            propFailures: testErrors.length,
            env,
          },
          logLevels.warning
        );

        testErrors.forEach(error =>
          failures.push({ test: testDescription, error })
        );
      }
    });
  });

  localLog({ msg: 'End run', runNumber, testCount, env });

  return { testCount, failures };
}
