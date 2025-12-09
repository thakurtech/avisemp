import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireManager, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const createLeaveSchema = z.object({
    type: z.enum(['CASUAL', 'SICK', 'EARNED', 'UNPAID']),
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().min(5),
});

// GET /api/leaves - Get leave requests
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { role, id } = req.user!;
        const { status } = req.query;

        let whereClause: any = {};

        if (role === 'EMPLOYEE') {
            whereClause.employeeId = id;
        } else if (role === 'MANAGER') {
            const teamMembers = await prisma.user.findMany({
                where: { managerId: id },
                select: { id: true },
            });
            const teamIds = teamMembers.map(m => m.id);
            whereClause.employeeId = { in: teamIds };
        }
        // Owner sees all

        if (status) {
            whereClause.status = status;
        }

        const leaves = await prisma.leaveRequest.findMany({
            where: whereClause,
            include: {
                employee: {
                    select: { id: true, name: true, avatar: true, department: true },
                },
                reviewer: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { appliedAt: 'desc' },
        });

        res.json({ leaves });
    } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ error: 'Failed to get leaves' });
    }
});

// POST /api/leaves - Apply for leave
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const data = createLeaveSchema.parse(req.body);

        const leave = await prisma.leaveRequest.create({
            data: {
                type: data.type,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                reason: data.reason,
                employeeId: req.user!.id,
            },
            include: {
                employee: {
                    select: { id: true, name: true },
                },
            },
        });

        res.status(201).json({ leave, message: 'Leave request submitted' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create leave error:', error);
        res.status(500).json({ error: 'Failed to create leave request' });
    }
});

// PATCH /api/leaves/:id/approve - Approve leave (Manager/Owner)
router.patch('/:id/approve', requireManager, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const leave = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                reviewerId: req.user!.id,
                reviewedAt: new Date(),
            },
        });

        res.json({ leave, message: 'Leave approved' });
    } catch (error) {
        console.error('Approve leave error:', error);
        res.status(500).json({ error: 'Failed to approve leave' });
    }
});

// PATCH /api/leaves/:id/reject - Reject leave (Manager/Owner)
router.patch('/:id/reject', requireManager, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const leave = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                reviewerId: req.user!.id,
                reviewedAt: new Date(),
            },
        });

        res.json({ leave, message: 'Leave rejected' });
    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({ error: 'Failed to reject leave' });
    }
});

// GET /api/leaves/balance - Get leave balance
router.get('/balance', async (req: AuthRequest, res: Response) => {
    try {
        const year = new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: req.user!.id,
                status: 'APPROVED',
                startDate: { gte: startOfYear, lte: endOfYear },
            },
        });

        // Calculate days used per type
        const used = { casual: 0, sick: 0, earned: 0, unpaid: 0 };
        approvedLeaves.forEach(leave => {
            const days = Math.ceil(
                (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

            switch (leave.type) {
                case 'CASUAL': used.casual += days; break;
                case 'SICK': used.sick += days; break;
                case 'EARNED': used.earned += days; break;
                case 'UNPAID': used.unpaid += days; break;
            }
        });

        // Default allowances (can be configured per company)
        const balance = {
            casual: Math.max(0, 12 - used.casual),
            sick: Math.max(0, 12 - used.sick),
            earned: Math.max(0, 24 - used.earned),
        };

        res.json({ balance, used });
    } catch (error) {
        console.error('Get leave balance error:', error);
        res.status(500).json({ error: 'Failed to get balance' });
    }
});

export default router;
