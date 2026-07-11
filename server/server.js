const app = require('./app');
const { connectDatabase } = require('./config/db');
const { PORT } = require('./config/env');
const logger = require('./utils/logger');

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
