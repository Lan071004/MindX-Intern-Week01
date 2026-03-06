import { Router, Request, Response } from 'express';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { IAuthService } from '../../../../ports/inbound/IAuthService';

export const createAuthRouter = (authService: IAuthService) => {
  const router = Router();
  const verifyToken = createAuthMiddleware(authService);

  // POST /auth/verify — xác thực token và trả về user info
  router.post('/verify-token', verifyToken, (req: Request, res: Response) => {
    res.status(200).json({
      message: 'Token is valid',
      user: {
        uid: req.userId,
        email: req.userEmail,
      },
    });
  });
  
  return router;
};