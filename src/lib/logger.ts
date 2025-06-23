import pino from 'pino';

const logger = pino({
  name: 'alos.coffee',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export default logger; 