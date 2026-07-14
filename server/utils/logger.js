const { NODE_ENV } = require('../config/env');

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();

  if (NODE_ENV === 'production') {
    return JSON.stringify({ timestamp, level, message, ...(meta ? { meta } : {}) });
  }

  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

function log(level, message, meta) {
  if (NODE_ENV === 'test') return;

  const output = formatMessage(level, message, meta);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
