import express, { Request, Response, NextFunction } from 'express';
import { Sentiments, Sentiment } from '../types';
import { Container } from 'typedi';
import { Results } from '../services';

const router = express.Router();
router.get(
  '/api/results',
  async (req: Request, res: Response, next: NextFunction) => {
    const { Sentiment: sen } = req.query;
    if (sen && !Object.values(Sentiment).includes(sen as Sentiment)) {
      return res
        .status(400)
        .send({ status: 400, message: `unknow sentiment type ${sen}` });
    } else if (!sen) {
      return res
        .status(400)
        .send({ status: 400, message: `no sentiment filter provided` });
    } else {
      const resultsService = Container.get(Results);
      try {
        const results = await resultsService.getResults(sen as Sentiment);
        res.status(200).send(results);
      } catch (error) {
        return next(error);
      }
    }
  }
);

export default router;
