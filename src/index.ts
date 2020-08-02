import Feeder from './services/Feeder';
import dotenv from 'dotenv';
import Analyzer from './services/Analyzer';
import { checkConfig } from './utils';

dotenv.config();

const start = () => {
  checkConfig();
  const feeder = new Feeder();
  const analyzer = new Analyzer();
  try {
    feeder.start();
    analyzer.start();
  } catch (error) {
    console.error(error);
  }
};

start();
