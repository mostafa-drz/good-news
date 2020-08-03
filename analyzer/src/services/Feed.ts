import AWS from 'aws-sdk';

export interface FeedItem {
  title?: string;
  description?: string;
  summary?: string;
  data?: string;
  link?: string;
  guid?: string;
  meta?: any;
  source_title?: string;
  source_description?: string;
  source_link?: string;
  sentimentResults: Array<
    AWS.Comprehend.BatchDetectSentimentItemResult & { text: string }
  >;
  overAllScore: Result | undefined;
}
class Feed implements FeedItem {
  private _sentimentResults: Array<
    AWS.Comprehend.BatchDetectSentimentItemResult & { text: string }
  > = [];
  public overAllScore: Result | undefined = undefined;
  constructor(props: FeedItem) {
    Object.assign(this, props);
  }

  set sentimentResults(
    value: Array<
      AWS.Comprehend.BatchDetectSentimentItemResult & { text: string }
    >
  ) {
    this._sentimentResults = value;
    this.setOverAll();
  }

  get sentimentResults(): Array<
    AWS.Comprehend.BatchDetectSentimentItemResult & { text: string }
  > {
    return this._sentimentResults;
  }

  private setOverAll(): void {
    const overAllPositive = this._sentimentResults.reduce((sum, result) => {
      if (result?.SentimentScore?.Positive) {
        return sum + result?.SentimentScore?.Positive;
      }
      return sum;
    }, 0);
    const overAllNegative = this._sentimentResults.reduce((sum, result) => {
      if (result?.SentimentScore?.Negative) {
        return sum + result?.SentimentScore?.Negative;
      }
      return sum;
    }, 0);
    const overAllNeutral = this._sentimentResults.reduce((sum, result) => {
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
    this.overAllScore = {
      overall: {
        Sentiment: overAllSentiment,
        SentimentScore: overAllScore
      },
      scores: this._sentimentResults.map((result, index) => ({
        text: result.text,
        SentimentScore: result.SentimentScore || {},
        Sentiment: (result.Sentiment || '') as Sentiment
      }))
    };
  }
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
export default Feed;
