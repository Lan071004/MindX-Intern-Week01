import { Router, Request, Response } from 'express';
import { IAuthService } from '../../../../ports/inbound/IAuthService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

export const createProtectedRouter = (authService: IAuthService) => {
  const router = Router();
  const verifyToken = createAuthMiddleware(authService);

  // GET /protected/data — endpoint bảo vệ, chỉ trả về data nếu token hợp lệ
  router.get('/profile', verifyToken, (req: Request, res: Response) => {
    res.status(200).json({  
      message: 'This is protected data',
      user: {
        uid: req.userId,
        email: req.userEmail,
      },
      timestamp: new Date().toISOString(),
    });
  });
    
  return router;
};