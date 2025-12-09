import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireManager, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schema
const createTaskSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    deadline: z.string().optional(),
    assigneeId: z.string(),
});

// GET /api/tasks - Get tasks based on role
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { role, id } = req.user!;
        const { status, priority } = req.query;

        let whereClause: any = {};

        if (role === 'EMPLOYEE') {
            // Employee sees only their tasks
            whereClause.assigneeId = id;
        } else if (role === 'MANAGER') {
            // Manager sees tasks assigned to their team
            const teamMembers = await prisma.user.findMany({
                where: { managerId: id },
                select: { id: true },
            });
            const teamIds = [id, ...teamMembers.map(m => m.id)];
            whereClause.assigneeId = { in: teamIds };
        }
        // Owner sees all tasks (no filter)

        // Apply optional filters
        if (status) whereClause.status = status;
        if (priority) whereClause.priority = priority;

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { comments: true },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { deadline: 'asc' },
                { createdAt: 'desc' },
            ],
        });

        res.json({ tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assignee: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
                comments: {
                    include: {
                        author: {
                            select: { id: true, name: true, avatar: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ task });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Failed to get task' });
    }
});

// POST /api/tasks - Create task (Manager/Owner only)
router.post('/', requireManager, async (req: AuthRequest, res: Response) => {
    try {
        const data = createTaskSchema.parse(req.body);

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority || 'MEDIUM',
                deadline: data.deadline ? new Date(data.deadline) : null,
                assigneeId: data.assigneeId,
                createdById: req.user!.id,
            },
            include: {
                assignee: {
                    select: { id: true, name: true },
                },
            },
        });

        res.status(201).json({ task, message: 'Task created successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const task = await prisma.task.update({
            where: { id },
            data: { status },
        });

        res.json({ task, message: 'Task status updated' });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// PUT /api/tasks/:id - Update task (Manager/Owner)
router.put('/:id', requireManager, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, priority, deadline, assigneeId } = req.body;

        const task = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                priority,
                deadline: deadline ? new Date(deadline) : null,
                assigneeId,
            },
        });

        res.json({ task, message: 'Task updated successfully' });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /api/tasks/:id - Delete task (Manager/Owner)
router.delete('/:id', requireManager, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.task.delete({
            where: { id },
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// POST /api/tasks/:id/comments - Add comment
router.post('/:id/comments', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content required' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                taskId: id,
                authorId: req.user!.id,
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });

        res.status(201).json({ comment });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

export default router;
