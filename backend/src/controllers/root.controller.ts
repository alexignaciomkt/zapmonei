import { Request, Response } from 'express';

export const getRoot = (req: Request, res: Response) => {
  res.json({
    service: 'ZapMonei API',
    version: '2.0.0',
    status: 'online',
  });
};
