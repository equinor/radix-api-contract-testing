import { checkExact } from 'swagger-proptypes';
import { expect } from 'chai';
import Mocha, { Suite, Test } from 'mocha';

export default async function runIntegrationTest(apiProps, sampleModelData) {
  var mochaInstance = new Mocha();
  var suite = Suite.create(
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

  return new Promise((resolve, reject) => {
    const failures = [];
    const runner = mochaInstance.run(errorCount =>
      errorCount ? reject(failures) : resolve()
    );

    runner.on('fail', test => {
      failures.push({
        test: test.title,
        error: test.err.actual,
      });
    });
  });
}
