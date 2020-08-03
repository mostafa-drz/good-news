import express, { Request, Response } from 'express';
import { Sentiments, Sentiment } from '../types';
import { Container } from 'typedi';
import { Results } from '../services';

const router = express.Router();
router.get('/api/results', (req: Request, res: Response) => {
  const { Sentiment: sen } = req.query;
  if (!sen) {
    return res
      .status(400)
      .send({ status: 400, message: 'sentiment missing in query param' });
  } else if (!Sentiments[sen as keyof typeof Sentiment]) {
    return res
      .status(400)
      .send({ status: 400, message: `unknow sentiment type ${sen}` });
  } else {
    const resultsService = Container.get(Results);
    resultsService.getAllPositive();
  }
});

export default router;
