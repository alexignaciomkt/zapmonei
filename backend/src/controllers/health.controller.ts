import { Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import logger from '../config/logger';

export const getHealth = async (req: Request, res: Response) => {
  let databaseStatus = 'offline';
  let redisStatus = 'offline';

  try {
    // Verifica conexão do Postgres executando uma query simples
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'online';
  } catch (error: any) {
    logger.error(`Database health check failed: ${error.message}`);
  }

  try {
    // Verifica conexão do Redis executando ping
    const pong = await redis.ping();
    if (pong === 'PONG') {
      redisStatus = 'online';
    }
  } catch (error: any) {
    logger.error(`Redis health check failed: ${error.message}`);
  }

  const isHealthy = databaseStatus === 'online' && redisStatus === 'online';
  const httpStatus = isHealthy ? 200 : 500;

  res.status(httpStatus).json({
    service: 'ZapMonei API',
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks: {
      api: 'online',
      postgres: databaseStatus,
      redis: redisStatus,
    },
  });
};
