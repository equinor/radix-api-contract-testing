'use strict';

(function() {
  const $ = id => document.getElementById(id);

  $('trigger-tests').addEventListener('click', function() {
    fetch('/trigger-tests', { method: 'POST' });
  });

  $('trigger-update').addEventListener('click', function() {
    fetch('/trigger-update', { method: 'POST' });
  });
})();
