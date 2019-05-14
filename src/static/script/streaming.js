'use strict';

const $ = id => document.getElementById(id);
$('last-update').innerText = new Date().toString();

if (typeof io !== 'undefined') {
  const socket = io();

  socket.on('change', function(newState) {
    let envState;

    Object.keys(newState.environments).forEach(envName => {
      envState = newState.environments[envName];

      const envEl = $(`env-${envName}`);

      envEl.classList.toggle(
        'c-env--succeeded',
        envState.latestTestRunSucceeded
      );
      envEl.classList.toggle('c-env--failed', !envState.latestTestRunSucceeded);
      envEl.classList.toggle(
        'c-env--pipeline-failed',
        !envState.pipelineSucceeded
      );

      envEl.classList.remove(
        'c-env--initialising',
        'c-env--waiting',
        'c-env--running'
      );
      envEl.classList.add(`c-env--${envState.testRunStatus}`);

      $(`env-${envName}_latestTestRunTimestamp`).innerText =
        envState.latestTestRunTimestamp;

      $(`env-${envName}_latestTestCount`).innerText = envState.latestTestCount;

      $(`env-${envName}_latestTestErrors`).innerHTML = `
        <ul>
        ${(envState.latestTestErrors || [])
          .map(
            testError => `
              <li>
                <dl>
                  <dt>test</dt>
                  <dd>${testError.test}</dd>
                  <dt>error</dt>
                  <dd>${testError.error}</dd>
                </dl>
              </li>`
          )
          .join('')}
      </ul>`;

      $(`env-${envName}_latestTestRunSucceeded`).innerText =
        envState.latestTestRunSucceeded;

      $(`env-${envName}_testRunStatus`).innerText = envState.testRunStatus;

      $(`env-${envName}_pipelineSucceeded`).innerText =
        envState.pipelineSucceeded;
    });

    $('last-update').innerText = new Date().toString();
  });
} else {
  console.error("socket.io not loaded; streaming won't work");
}
