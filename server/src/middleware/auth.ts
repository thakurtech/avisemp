import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'avis-secret-key-change-in-production';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: 'OWNER' | 'MANAGER' | 'EMPLOYEE';
        name: string;
    };
}

// Verify JWT token
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, name: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Check if user is Owner
export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'OWNER') {
        return res.status(403).json({ error: 'Owner access required' });
    }
    next();
};

// Check if user is Owner or Manager
export const requireManager = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'MANAGER') {
        return res.status(403).json({ error: 'Manager access required' });
    }
    next();
};

// Generate JWT token
export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export { JWT_SECRET };
