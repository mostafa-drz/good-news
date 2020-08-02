// feeder?!!!
//is it even a thing?
import cron from 'node-cron';
import getFeed from './Feed';
import AWS from 'aws-sdk';
AWS.config.update({ region: process.env.AWS_REGION });
const SQS = new AWS.SQS({
  apiVersion: '2012-11-05',
  region: process.env.AWS_REGION || 'ca-central-1'
});

export interface FeedItem {
  title?: string;
  description?: string;
  summary?: string;
  data?: string;
  link?: string;
  guid?: string;
}
const URLS = [
  'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009',
  'http://feeds.bbci.co.uk/news/rss.xml?edition=int'
];
class Feeder {
  public static start(): void {
    cron.schedule(
      '* * * * *',
      () => {
        URLS.forEach((url: string) => {
          getFeed(url, this.sendResultsToSQS);
        });
      },
      {}
    );
  }

  private static sendResultsToSQS = (results: FeedItem[]) => {
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
