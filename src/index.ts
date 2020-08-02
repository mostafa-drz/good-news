import App from './server';
import Feeder from './services/Feeder';
import dotenv from 'dotenv';
import Analyzer from './services/Analyzer';

dotenv.config();
const PORT = process.env.PORT || 3000;

const start = () => {
  App.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT} 🚀`);
  });
  // Feeder.start();
  const analyzer = new Analyzer();
  analyzer.start();
};

start();
