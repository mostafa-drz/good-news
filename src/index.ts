import express, { NextFunction, Response, Request } from 'express';
import Sentiment from './services/Sentiment';
import bodyParser from 'body-parser';
import getFeed from './services/Feed';

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const PORT = process.env.PORT || 3000;

app.get('/api/ping', (req, res) => {
  res.status(200).send('Pong');
});
app.post(
  '/api/sentiment',
  async (req: Request, resp: Response, next: NextFunction) => {
    const { texts } = req.body;
    const sentiment = new Sentiment(texts);
    try {
      const scores = await sentiment.getSentimentScore();
      resp.status(200).send(scores);
    } catch (error) {
      next(error);
    }
  }
);
app.get(
  '/api/rss-sentiment',
  async (req: Request, resp: Response, next: NextFunction) => {
    const { url } = req.body;
    const results = await getFeed(url);
    resp.status(200).send(results);
  }
);

app.use(function (req, res, next) {
  res.status(404).send('Sorry:( what are you looking for?');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Oops! something not working!');
});

app.listen(PORT);
