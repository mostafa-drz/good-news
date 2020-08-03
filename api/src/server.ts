import express, { Request, Response, NextFunction } from 'express';
import router from './routes';
import bodyParser from 'body-parser';
import { CustomError } from './types';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(router);
app.use((req: Request, res: Response, next) => {
  const err: CustomError = new Error('Not Found');
  err['status'] = 404;
  next(err);
});
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    return res
      .status(err.status || 400)
      .send({ message: err.message })
      .end();
  }
  return next(err);
});
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message
    }
  });
});
export const startServer = (): void => {
  try {
    app.listen(PORT, () => {
      console.log(`API server is running on ${PORT} 🚀`);
    });
  } catch (error) {
    console.error(`Oops something is not happy🙊`, error);
  }
};
