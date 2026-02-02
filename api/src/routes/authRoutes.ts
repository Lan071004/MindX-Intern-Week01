import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/verify - Verify token và trả user info
// Frontend gọi endpoint này sau khi login để confirm token hợp lệ
router.post('/verify', verifyToken, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Token is valid',
    user: {
      uid: req.userId,
      email: req.userEmail,
    },
  });
});

export default router;