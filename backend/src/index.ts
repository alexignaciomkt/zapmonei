import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import router from './routes';
import { logger, requestLogger } from './config/logger';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Acopla o middleware de log global de requisições HTTP
app.use(requestLogger);

app.use(router);

app.listen(port, () => {
  logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
});
