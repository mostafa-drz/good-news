import App from './server';
import Feeder from './services/Feeder';

const PORT = process.env.PORT || 3000;

const start = () => {
  App.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT} 🚀`);
  });
  Feeder.start();
};

start();
