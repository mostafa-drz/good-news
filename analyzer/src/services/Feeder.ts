// feeder?!!!
//is it even a thing?
import cron from 'node-cron';
import getFeed from './getFeed';
import AWS from 'aws-sdk';
import { FeedItem } from './Feed';

AWS.config.update({ region: process.env.AWS_REGION });
const SQS = new AWS.SQS({
  apiVersion: '2012-11-05',
  region: process.env.AWS_REGION || 'ca-central-1'
});

const URLS = [
  'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009',
  'http://feeds.bbci.co.uk/news/rss.xml',
  'http://feeds.bbci.co.uk/news/business/rss.xml',
  'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  'http://feeds.bbci.co.uk/news/technology/rss.xml',
  'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
  'http://feeds.bbci.co.uk/news/rss.xml?edition=int'
];
class Feeder {
  public start(): void {
    cron.schedule(
      process.env.FEEDER_INTERVAL as string,
      () => {
        URLS.forEach((url: string) => {
          getFeed(url, this.sendResultsToSQS);
        });
      },
      {}
    );
  }

  private sendResultsToSQS = (results: FeedItem[]) => {
    results.forEach((result: FeedItem) => {
      const params: AWS.SQS.SendMessageRequest = {
        MessageBody: JSON.stringify(result),
        QueueUrl: process.env.AWS_SQS_QUEUE_URL as string
      };
      SQS.sendMessage(params, (error, data) => {
        if (error) {
          console.log('something went wrong sending data to SQS', error);
        }
      });
    });
  };
}

export default Feeder;
