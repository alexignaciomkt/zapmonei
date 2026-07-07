import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const baseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'zapmonei-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Estende o logger base com o método customizado request para logs HTTP
export const logger = Object.assign(baseLogger, {
  request: (method: string, url: string, status: number, duration: number, error?: string) => {
    baseLogger.info(`[REQUEST] ${method} ${url} - Status: ${status} - Duration: ${duration}ms${error ? ` - Error: ${error}` : ''}`);
  }
});

// Middleware Express para registrar de forma automática todas as requisições HTTP recebidas
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req.method, req.originalUrl, res.statusCode, duration);
  });
  next();
};

export default logger;
