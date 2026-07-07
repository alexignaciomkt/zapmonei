import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import router from './routes';
import { logger, requestLogger } from './config/logger';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Acopla o middleware de log global de requisições HTTP
app.use(requestLogger);

app.use(router);

app.listen(port, () => {
  logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
});
