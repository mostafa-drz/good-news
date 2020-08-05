import AWS from 'aws-sdk';
import { Service } from 'typedi';
import { Sentiment } from '../types';

const docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'ca-central-1'
});

@Service()
class Results {
  public async getResults(
    sentiment: Sentiment
  ): Promise<AWS.DynamoDB.DocumentClient.ItemList | undefined | Error> {
    switch (sentiment) {
      case Sentiment.Positive:
        return this.getAllPositive();
      case Sentiment.Negative:
        return this.getAllNegatives();
      case Sentiment.Neutral:
        return this.getAllNeutrals();
      default:
        return [];
    }
  }
  public async getAllPositive(): Promise<
    AWS.DynamoDB.DocumentClient.ItemList | undefined | Error
  > {
    return this.query(Sentiment.Positive);
  }
  public async getAllNegatives(): Promise<
    AWS.DynamoDB.DocumentClient.ItemList | undefined | Error
  > {
    return this.query(Sentiment.Negative);
  }
  public async getAllNeutrals(): Promise<
    AWS.DynamoDB.DocumentClient.ItemList | undefined | Error
  > {
    return this.query(Sentiment.Neutral);
  }
  public async getAll(): Promise<
    AWS.DynamoDB.DocumentClient.ItemList | undefined | Error
  > {
    return this.query();
  }
  private async query(
    sentiment?: Sentiment
  ): Promise<AWS.DynamoDB.DocumentClient.ItemList | undefined | Error> {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.AWS_RESULTS_TABLE as string,
        KeyConditionExpression: '#Sentiment = :Sentiment',
        IndexName: 'Sentiment-date-index',
        ProjectionExpression:
          'summary, Sentiment, overAllScore,source_title, #date, link, id, title',
        ExpressionAttributeValues: { ':Sentiment': sentiment },
        ExpressionAttributeNames: {
          '#Sentiment': 'Sentiment',
          '#date': 'date'
        }
      };
      docClient.query(params, (error, data) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(data.Items);
        }
      });
    });
  }
}

export default Results;
