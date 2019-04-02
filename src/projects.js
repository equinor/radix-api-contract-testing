import apiFetcher from './project-api/fetcher';
import apiUpdater from './project-api/updater';
import webConsoleFetcher from './project-web-console/fetcher';
import webConsoleUpdater from './project-web-console/updater';

export const fetchers = {
  api: apiFetcher,
  webConsole: webConsoleFetcher,
};

export const updaters = {
  api: apiUpdater,
  webConsole: webConsoleUpdater,
};
