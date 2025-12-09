import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authenticate, requireOwner, requireManager, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schema for creating user
const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(['MANAGER', 'EMPLOYEE']),
    designation: z.string().optional(),
    department: z.string().optional(),
    managerId: z.string().optional(),
});

// GET /api/users - Get all users (Owner: all, Manager: team, Employee: self)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { role, id } = req.user!;

        let whereClause = {};

        if (role === 'MANAGER') {
            // Manager sees their team
            whereClause = { managerId: id };
        } else if (role === 'EMPLOYEE') {
            // Employee sees only self
            whereClause = { id };
        }
        // Owner sees all (no filter)

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                designation: true,
                department: true,
                avatar: true,
                status: true,
                joinDate: true,
                managerId: true,
                manager: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { assignedTasks: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                designation: true,
                department: true,
                avatar: true,
                status: true,
                joinDate: true,
                managerId: true,
                manager: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// POST /api/users - Create new user (Owner only)
router.post('/', requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const data = createUserSchema.parse(req.body);

        // Check if email exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });

        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: data.role,
                designation: data.designation,
                department: data.department,
                managerId: data.managerId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                designation: true,
                department: true,
                managerId: true,
            },
        });

        res.status(201).json({ user, message: 'User created successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id - Update user (Owner only)
router.put('/:id', requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, phone, designation, department, managerId, status, role } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                phone,
                designation,
                department,
                managerId,
                status,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                designation: true,
                department: true,
                status: true,
            },
        });

        res.json({ user, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Delete user (Owner only)
router.delete('/:id', requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (id === req.user!.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        await prisma.user.delete({
            where: { id },
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET /api/users/managers/list - Get all managers (for assignment dropdown)
router.get('/managers/list', async (req: AuthRequest, res: Response) => {
    try {
        const managers = await prisma.user.findMany({
            where: { role: 'MANAGER' },
            select: { id: true, name: true, email: true, department: true },
        });

        res.json({ managers });
    } catch (error) {
        console.error('Get managers error:', error);
        res.status(500).json({ error: 'Failed to get managers' });
    }
});

export default router;
