import express, { Request, Response } from 'express';

const router = express.Router();
router.get('/api/ping', (req: Request, res: Response) => {
  res.status(200).send(`PONG `);
});

export default router;
