import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../../../../ports/inbound/IAuthService';
import { AuthError } from '../../../../domain/errors/AuthError';

// Extend Express Request để thêm user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export const createAuthMiddleware = (authService: IAuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = await authService.verifyToken(token);
      req.userId = user.uid;
      req.userEmail = user.email;
      next();
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(401).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};