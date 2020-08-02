import AWS from 'aws-sdk';
import cron from 'node-cron';
import { FeedItem } from './Feeder';

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
    cron.schedule('* * * * *', this.poll.bind(this), {});
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
        let feed: FeedItem = {};
        if (Body) {
          try {
            feed = JSON.parse(Body);
          } catch (error) {
            //not a valid json
            this.deleteMessage(message);
          }
          this.getSentimentScore([
            feed.title || '',
            feed.summary || '',
            feed.description || ''
          ])
            .then(this.getOverAll)
            .then((r) => {
              this.recordResult(r, feed, message);
            })
            .then(() => this.deleteMessage(message))
            .then(() => {
              console.log('done', feed.guid);
            });
        }
      });
    }
  }

  private getSentimentScore(
    texts: string[]
  ): Promise<{
    results: AWS.Comprehend.ListOfDetectSentimentResult;
    texts: string[];
  }> {
    const params = {
      LanguageCode: 'en',
      TextList: Array.from(new Set(texts))
    };
    return new Promise((resolve, reject) => {
      Comprehend.batchDetectSentiment(params, (error, data) => {
        if (error) {
          return reject(error);
        } else {
          return resolve({ results: data.ResultList, texts });
        }
      });
    });
  }

  private getOverAll({
    results,
    texts
  }: {
    results: AWS.Comprehend.BatchDetectSentimentItemResult[];
    texts: string[];
  }): Result {
    const overAllPositive = results.reduce((sum, result) => {
      if (result?.SentimentScore?.Positive) {
        return sum + result?.SentimentScore?.Positive;
      }
      return sum;
    }, 0);
    const overAllNegative = results.reduce((sum, result) => {
      if (result?.SentimentScore?.Negative) {
        return sum + result?.SentimentScore?.Negative;
      }
      return sum;
    }, 0);
    const overAllNeutral = results.reduce((sum, result) => {
      if (result?.SentimentScore?.Neutral) {
        return sum + result?.SentimentScore?.Neutral;
      }
      return sum;
    }, 0);
    const overAllScore = {
      Positive: overAllPositive,
      Negative: overAllNegative,
      Neutral: overAllNeutral
    };
    const overAllSentiment = getSentiment(overAllScore);
    return {
      overall: {
        Sentiment: overAllSentiment,
        SentimentScore: overAllScore
      },
      scores: results.map((result, index) => ({
        text: texts[index],
        SentimentScore: result.SentimentScore || {},
        Sentiment: (result.Sentiment || '') as Sentiment
      }))
    };
  }

  private recordResult(
    result: Result,
    feed: FeedItem,
    sqsMessage: AWS.SQS.Message
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const feedResult = {
        id: sqsMessage.MessageId,
        ...feed,
        ...result.overall
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

interface Result {
  overall: {
    Sentiment: AWS.Comprehend.SentimentType;
    SentimentScore: AWS.Comprehend.SentimentScore;
  };
  scores: {
    text: string;
    SentimentScore: AWS.Comprehend.SentimentScore;
    Sentiment: Sentiment;
  }[];
}

enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL'
}

const getSentiment = (
  score: AWS.Comprehend.SentimentScore
): AWS.Comprehend.SentimentType => {
  const MAX = Math.max(
    score.Negative || 0,
    score.Positive || 0,
    score.Neutral || 0
  );
  if (MAX === score.Negative) {
    return Sentiment.NEGATIVE;
  } else if (MAX === score.Positive) {
    return Sentiment.POSITIVE;
  } else {
    return Sentiment.NEUTRAL;
  }
};
export default Analyzer;
