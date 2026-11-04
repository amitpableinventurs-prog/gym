// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import User from '../models/User';

interface AuthTokenPayload {
  id: string;
  isAdmin: boolean;
  isCoach: boolean;
  [key: string]: unknown;
}

// Add at the top of the file
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  let claims: jwt.JwtPayload & { id: string };
  try {
    const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH || 'public.pem');
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    if (typeof decoded === 'string' || typeof decoded.id !== 'string') {
      res.status(401).json({ message: 'Invalid token, authorization denied' });
      return;
    }
    claims = decoded as jwt.JwtPayload & { id: string };
  } catch (error) {
    res.status(401).json({ message: 'Invalid token, authorization denied' });
    return;
  }

  try {
    // Roles and suspension come from the database so changes apply to live tokens.
    const user = await User.findById(claims.id).select('isAdmin isCoach isSuspended').lean();
    if (!user) {
      res.status(401).json({ message: 'Invalid token, authorization denied' });
      return;
    }
    if (user.isSuspended) {
      res.status(403).json({ message: 'This account has been suspended', code: 'ACCOUNT_SUSPENDED' });
      return;
    }

    req.user = { ...claims, isAdmin: !!user.isAdmin, isCoach: !!user.isCoach };
    next();
  } catch (error) {
    console.error('Unable to verify account:', error);
    res.status(500).json({ message: 'Unable to verify account' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: 'Administrator access required' });
    return;
  }
  next();
};
