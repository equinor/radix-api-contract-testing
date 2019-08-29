import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import expressHbs from 'express-handlebars';

import { name as appName, version as appVersion } from '../package.json';

import { getEnvironemnts } from './utils';
import { makeLogger } from './logger';
import { runPipelineAndUpdateState } from './pipeline';
import { setupStreaming } from './streaming';
import webhookHandler from './webhook';
import * as state from './state';
import * as hbsHelpers from './hbs-helpers';
import http from 'http';
import socketIo from 'socket.io';

const localLog = makeLogger({ component: 'app' });

localLog({ msg: 'Starting with config', config });

state.init();

// --- Set up server -----------------------------------------------------------

const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);

// --- Handlebars templating ---------------------------------------------------

const hbs = expressHbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    compare: hbsHelpers.compare,
    unixtime: hbsHelpers.unixtime,
  },
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', `${__dirname}/views`);
app.use(bodyParser.text({ type: '*/*' }));

setupStreaming(io);

// --- Routing -----------------------------------------------------------------

app.use('/static', express.static(`${__dirname}/static`));

app.use(
  '/sanitize.css',
  express.static(`${__dirname}/../node_modules/sanitize.css/sanitize.css`)
);

app.get('/', (_, res) =>
  res.render('index', {
    appName,
    appVersion,
    state: state.getState(),
  })
);

app.post('/trigger-tests', (_, res) => {
  getEnvironemnts().forEach(env => {
    runPipelineAndUpdateState(env, []);
  });
  res.send('triggered tests');
});

app.post('/trigger-update', (_, res) => {
  getEnvironemnts().forEach(env => {
    runPipelineAndUpdateState(env);
  });
  res.send('triggered update and tests');
});

app.get('/metrics', (_, res) => {
  res.type('text/plain');
  res.render('metrics', {
    layout: null,
    state: state.getState(),
  });
});

app.post('/webhook', webhookHandler);

// --- Server startup ----------------------------------------------------------

const port = config.get('port');

server.listen(port, () => {
  localLog(`${appName} ${appVersion} listening on port ${port}`);

  getEnvironemnts().forEach(env => {
    runPipelineAndUpdateState(env);
  });
});
