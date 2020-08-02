const REQUIRED_CONFIGS = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SQS_QUEUE_URL',
  'AWS_REGION',
  'AWS_RESULTS_TABLE',
  'FEEDER_INTERVAL',
  'AWS_SQS_POLLING_INTERVAL'
];
const checkConfig = () => {
  REQUIRED_CONFIGS.forEach((config: string) => {
    if (!process.env[config]) {
      throw Error(`${config} is missing in environment variables`);
    }
  });
};

export default checkConfig;
