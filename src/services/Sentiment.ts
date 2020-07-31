import { Comprehend } from 'aws-sdk';
import {} from 'aws-sdk/';

class Sentiment {
  private comprehand: Comprehend;
  private params: Comprehend.BatchDetectSentimentRequest;
  constructor(texts: string[]) {
    this.comprehand = new Comprehend({
      apiVersion: '2017-11-27',
      region: 'ca-central-1'
    });
    this.params = {
      LanguageCode: 'en',
      TextList: texts
    };
  }

  getSentimentScore(): Promise<Comprehend.ListOfDetectSentimentResult> {
    return new Promise((resolve, reject) => {
      this.comprehand.batchDetectSentiment(this.params, (error, data) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(data.ResultList);
        }
      });
    });
  }
}

export default Sentiment;
