const { NODE_ENV } = require('../config/env');

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;

  if (!meta) {
    return base;
  }

  return `${base} ${JSON.stringify(meta)}`;
}

function log(level, message, meta) {
  const output = formatMessage(level, message, meta);

  if (NODE_ENV === 'test') {
    return;
  }

  if (level === 'error') {
    console.error(output);
    return;
  }

  if (level === 'warn') {
    console.warn(output);
    return;
  }

  console.log(output);
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
