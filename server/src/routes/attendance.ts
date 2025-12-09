import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireManager, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Helper to get today's date at midnight
const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

// GET /api/attendance - Get attendance records
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { role, id } = req.user!;
        const { month, year } = req.query;

        let whereClause: any = {};

        if (role === 'EMPLOYEE') {
            whereClause.userId = id;
        } else if (role === 'MANAGER') {
            const teamMembers = await prisma.user.findMany({
                where: { managerId: id },
                select: { id: true },
            });
            const teamIds = [id, ...teamMembers.map(m => m.id)];
            whereClause.userId = { in: teamIds };
        }
        // Owner sees all

        // Date filter
        if (month && year) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0);
            whereClause.date = { gte: startDate, lte: endDate };
        }

        const records = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
            orderBy: { date: 'desc' },
        });

        res.json({ records });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Failed to get attendance' });
    }
});

// GET /api/attendance/today - Get today's status
router.get('/today', async (req: AuthRequest, res: Response) => {
    try {
        const today = getTodayDate();

        const record = await prisma.attendance.findFirst({
            where: {
                userId: req.user!.id,
                date: today,
            },
        });

        res.json({
            isClockedIn: record?.clockIn !== null && record?.clockOut === null,
            clockIn: record?.clockIn,
            clockOut: record?.clockOut,
            status: record?.status || null,
        });
    } catch (error) {
        console.error('Get today attendance error:', error);
        res.status(500).json({ error: 'Failed to get attendance' });
    }
});

// POST /api/attendance/clock-in
router.post('/clock-in', async (req: AuthRequest, res: Response) => {
    try {
        const today = getTodayDate();
        const now = new Date();

        // Check if already clocked in today
        const existing = await prisma.attendance.findFirst({
            where: {
                userId: req.user!.id,
                date: today,
            },
        });

        if (existing) {
            if (existing.clockIn && !existing.clockOut) {
                return res.status(400).json({ error: 'Already clocked in' });
            }
            if (existing.clockOut) {
                return res.status(400).json({ error: 'Already completed for today' });
            }
        }

        const record = await prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId: req.user!.id,
                    date: today,
                },
            },
            create: {
                userId: req.user!.id,
                date: today,
                clockIn: now,
                status: 'PRESENT',
            },
            update: {
                clockIn: now,
                status: 'PRESENT',
            },
        });

        res.json({
            record,
            message: 'Clocked in successfully',
            clockIn: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        });
    } catch (error) {
        console.error('Clock in error:', error);
        res.status(500).json({ error: 'Failed to clock in' });
    }
});

// POST /api/attendance/clock-out
router.post('/clock-out', async (req: AuthRequest, res: Response) => {
    try {
        const today = getTodayDate();
        const now = new Date();

        const existing = await prisma.attendance.findFirst({
            where: {
                userId: req.user!.id,
                date: today,
            },
        });

        if (!existing || !existing.clockIn) {
            return res.status(400).json({ error: 'Not clocked in today' });
        }

        if (existing.clockOut) {
            return res.status(400).json({ error: 'Already clocked out' });
        }

        const record = await prisma.attendance.update({
            where: { id: existing.id },
            data: { clockOut: now },
        });

        // Calculate hours
        const hours = (now.getTime() - existing.clockIn.getTime()) / (1000 * 60 * 60);

        res.json({
            record,
            message: 'Clocked out successfully',
            hoursWorked: hours.toFixed(2),
        });
    } catch (error) {
        console.error('Clock out error:', error);
        res.status(500).json({ error: 'Failed to clock out' });
    }
});

// GET /api/attendance/stats - Get monthly stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const records = await prisma.attendance.findMany({
            where: {
                userId: req.user!.id,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
        });

        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const halfDay = records.filter(r => r.status === 'HALF_DAY').length;

        // Calculate total hours
        let totalHours = 0;
        records.forEach(r => {
            if (r.clockIn && r.clockOut) {
                totalHours += (r.clockOut.getTime() - r.clockIn.getTime()) / (1000 * 60 * 60);
            }
        });

        res.json({
            present,
            absent,
            halfDay,
            totalHours: totalHours.toFixed(1),
        });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

export default router;
