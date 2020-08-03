export type CustomError = Error & { status?: number };
export enum Sentiment {
  Positive = 'POSITIVE',
  Negative = 'NEGATIVE',
  Neutral = 'NEUTRAL'
}
export const Sentiments: {
  [P in keyof typeof Sentiment]: Sentiment;
} = {
  Positive: Sentiment.Positive,
  Negative: Sentiment.Negative,
  Neutral: Sentiment.Neutral
};
