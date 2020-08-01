import App from './server';
import Feeder from './services/Feeder';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.AWS_SQS_QUEUE_URL);
console.log(process.env.AWS_REGION || 'ca-central-1');
const PORT = process.env.PORT || 3000;

const start = () => {
  App.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT} 🚀`);
  });
  Feeder.start();
};

start();
