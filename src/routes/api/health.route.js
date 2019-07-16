import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  return res.status(200).end('ok');
});

export default router;
