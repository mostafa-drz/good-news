import { Application, Request, Response } from 'express';
import ResultsRoutes from './results';

export default (app: Application): void => {
  app.use(ResultsRoutes);
  console.log('ok hr');
  app.get('/api/ping', (req: Request, res: Response) => {
    res.status(200).send(`PONG `);
  });
};
