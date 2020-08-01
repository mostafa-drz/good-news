// feeder?!!!
//is it even a thing?
import cron from 'node-cron';
import getFeed from './Feed';

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
          getFeed(url);
        });
      },
      {}
    );
  }
}

export default Feeder;
