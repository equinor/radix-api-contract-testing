import { makeLogger, logLevels } from './logger';
import { stateEvents } from './state';

const localLog = makeLogger({ component: 'streaming' });

export function setupStreaming(io) {
  io.on('connection', function(socket) {
    localLog('Client connected');

    socket.on('disconnect', function() {
      localLog('Client disconnected');
    });
  });

  stateEvents.on('change', newState => io.emit('change', newState));
}
