import AWS from 'aws-sdk';
import { Service } from 'typedi';

const docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'ca-central-1'
});

@Service()
class Results {
  public async getAllPositive(): Promise<void> {
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: process.env.AWS_RESULTS_TABLE as string,
      IndexName: 'Sentiment-date-index',
      ExpressionAttributeValues: {
        ':sentiment': {
          S: 'PPOSITIVE'
        }
      },
      KeyConditionExpression: 'Sentiment = :sentiment'
    };
    docClient.query(params, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        console.log(data);
      }
    });
  }
}

export default Results;
