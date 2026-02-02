import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// GET /api/protected/profile - Example protected route
router.get('/profile', verifyToken, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Access granted to protected resource',
    user: {
      uid: req.userId,
      email: req.userEmail,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;