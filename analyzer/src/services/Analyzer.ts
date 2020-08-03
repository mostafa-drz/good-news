import AWS from 'aws-sdk';
import Feed, { FeedItem } from './Feed';

const SQS = new AWS.SQS({
  apiVersion: '2012-11-05',
  region: process.env.AWS_REGION || 'ca-central-1'
});
const Comprehend = new AWS.Comprehend({
  apiVersion: '2017-11-27',
  region: process.env.AWS_REGION || 'ca-central-1'
});
const docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'ca-central-1'
});

class Analyzer {
  public start(): void {
    setInterval(() => {
      this.poll();
    }, Number(process.env.AWS_SQS_POLLING_INTERVAL));
  }
  private poll(): void {
    const params: AWS.SQS.ReceiveMessageRequest = {
      MaxNumberOfMessages: 10,
      QueueUrl: process.env.AWS_SQS_QUEUE_URL as string,
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0
    };
    SQS.receiveMessage(params, (error, data) => {
      if (error) {
        console.error(`Something went wrong polling from SQS`, error);
      } else {
        if (data && data.Messages && data.Messages.length > 0) {
          this.analyzeSentiment(data);
        } else {
          console.log('Nothing to analyze');
        }
      }
    });
  }

  private analyzeSentiment(data: AWS.SQS.ReceiveMessageResult): void {
    if (data.Messages) {
      data.Messages.forEach(async (message: AWS.SQS.Message) => {
        const { Body } = message;
        let feed: FeedItem | undefined = undefined;
        if (Body) {
          try {
            feed = new Feed(JSON.parse(Body));
          } catch (error) {
            //not a valid json
            this.deleteMessage(message);
          }
          if (typeof feed === undefined) {
            return false;
          }
          this.getSentimentScore(feed as Feed)
            .then((r) => {
              this.recordResult(feed as Feed, message);
            })
            .then(() => this.deleteMessage(message))
            .then(() => {
              console.log('done', feed?.guid);
            });
        }
      });
    }
  }

  private getSentimentScore(feed: FeedItem): Promise<any> {
    const texts = [
      feed.title || '',
      feed.description || '',
      feed.summary || ''
    ];
    const params = {
      LanguageCode: 'en',
      TextList: Array.from(new Set(texts))
    };
    return new Promise((resolve, reject) => {
      Comprehend.batchDetectSentiment(params, (error, data) => {
        if (error) {
          return reject(error);
        } else {
          feed.sentimentResults = data.ResultList.map(
            (result: AWS.Comprehend.BatchDetectSentimentItemResult, index) => ({
              ...result,
              text: texts[index]
            })
          );
          return resolve();
        }
      });
    });
  }
  private recordResult(
    feed: FeedItem,
    sqsMessage: AWS.SQS.Message
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const feedResult = {
        id: sqsMessage.MessageId,
        Sentiment: feed?.overAllScore?.overall?.Sentiment,
        ...feed,
        ...feed.overAllScore
      };
      const tableName = process.env.AWS_RESULTS_TABLE as string;
      const params = {
        TableName: tableName,
        Item: feedResult
      };
      docClient.put(params, (error, data) => {
        if (error) {
          console.error(`Something went wrong recording the results ${error}`);
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  private deleteMessage(message: AWS.SQS.Message): void {
    const params: AWS.SQS.DeleteMessageRequest = {
      QueueUrl: process.env.AWS_SQS_QUEUE_URL as string,
      ReceiptHandle: message.ReceiptHandle as string
    };
    SQS.deleteMessage(params, (error, data) => {
      if (error) {
        console.error(
          `Something went wrong deleteing SQS message ${message.MessageId}`
        );
      }
    });
  }
}

export default Analyzer;
