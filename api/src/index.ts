import 'reflect-metadata';
import { startServer } from './server';
import dotenv from 'dotenv';
dotenv.config();
const start = (): void => {
  startServer();
};

start();
