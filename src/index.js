import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import expressHbs from 'express-handlebars';

import { name as appName, version as appVersion } from '../package.json';

import { getEnvironemnts } from './utils';
import { makeLogger } from './logger';
import { runPipelineAndUpdateState } from './pipeline';
import webhookHandler from './webhook';
import * as state from './state';

state.init();

const localLog = makeLogger({ component: 'app' });

// --- Set up server -----------------------------------------------------------

const app = express();
app.engine('.hbs', expressHbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', `${__dirname}/views`);
app.use('/static', express.static(`${__dirname}/static`));
app.use(bodyParser.text({ type: '*/*' }));

// --- Routing -----------------------------------------------------------------

app.get('/', (_, res) =>
  res.render('index', {
    appName,
    appVersion,
    state: state.getState(),
  })
);

app.get('/trigger', (_, res) => {
  getEnvironemnts().forEach(env => {
    runPipelineAndUpdateState(env, []);
  });
  res.send('triggered');
});

app.post('/webhook', webhookHandler);

// --- Server startup ----------------------------------------------------------

const port = config.get('port');

app.listen(port, () => {
  localLog(`${appName} ${appVersion} listening on port ${port}`);

  getEnvironemnts().forEach(env => {
    runPipelineAndUpdateState(env);
  });
});
