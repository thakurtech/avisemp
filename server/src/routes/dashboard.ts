import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/dashboard/stats - Get dashboard statistics based on role
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const { role, id } = req.user!;

        if (role === 'EMPLOYEE') {
            return res.json(await getEmployeeStats(id));
        } else if (role === 'MANAGER') {
            return res.json(await getManagerStats(id));
        } else {
            return res.json(await getOwnerStats());
        }
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Employee dashboard stats
async function getEmployeeStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
        where: { assigneeId: userId },
    });

    const todayAttendance = await prisma.attendance.findFirst({
        where: { userId, date: today },
    });

    const pendingLeaves = await prisma.leaveRequest.count({
        where: { employeeId: userId, status: 'PENDING' },
    });

    return {
        tasksTotal: tasks.length,
        tasksCompleted: tasks.filter(t => t.status === 'COMPLETED').length,
        tasksInProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        tasksPending: tasks.filter(t => t.status === 'PENDING').length,
        isClockedIn: todayAttendance?.clockIn !== null && todayAttendance?.clockOut === null,
        clockInTime: todayAttendance?.clockIn,
        pendingLeaves,
    };
}

// Manager dashboard stats
async function getManagerStats(managerId: string) {
    const teamMembers = await prisma.user.findMany({
        where: { managerId },
        select: { id: true },
    });
    const teamIds = teamMembers.map(m => m.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
        where: { assigneeId: { in: teamIds } },
    });

    const todayAttendance = await prisma.attendance.findMany({
        where: { userId: { in: teamIds }, date: today },
    });

    const pendingLeaves = await prisma.leaveRequest.count({
        where: { employeeId: { in: teamIds }, status: 'PENDING' },
    });

    const tasksUnderReview = tasks.filter(t => t.status === 'UNDER_REVIEW').length;

    return {
        teamSize: teamMembers.length,
        tasksTotal: tasks.length,
        tasksCompleted: tasks.filter(t => t.status === 'COMPLETED').length,
        tasksInProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        tasksPending: tasks.filter(t => t.status === 'PENDING').length,
        tasksUnderReview,
        teamPresent: todayAttendance.filter(a => a.clockIn !== null).length,
        teamAbsent: teamMembers.length - todayAttendance.filter(a => a.clockIn !== null).length,
        pendingApprovals: pendingLeaves + tasksUnderReview,
    };
}

// Owner dashboard stats
async function getOwnerStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const users = await prisma.user.findMany();
    const tasks = await prisma.task.findMany();

    const todayAttendance = await prisma.attendance.findMany({
        where: { date: today },
    });

    const monthlyTasks = await prisma.task.findMany({
        where: {
            createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
    });

    // Top performers (most completed tasks this month)
    const topPerformers = await prisma.task.groupBy({
        by: ['assigneeId'],
        where: {
            status: 'COMPLETED',
            updatedAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
    });

    const performerDetails = await Promise.all(
        topPerformers.map(async (p) => {
            const user = await prisma.user.findUnique({
                where: { id: p.assigneeId },
                select: { name: true },
            });
            return { name: user?.name || 'Unknown', tasksCompleted: p._count.id };
        })
    );

    // Department stats
    const departments = [...new Set(users.map(u => u.department).filter(Boolean))];

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return {
        totalEmployees: users.filter(u => u.role !== 'OWNER').length,
        totalManagers: users.filter(u => u.role === 'MANAGER').length,
        departments: departments.length,
        tasksTotal: tasks.length,
        tasksCompleted: completedTasks,
        tasksPending: tasks.filter(t => t.status === 'PENDING').length,
        tasksInProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        completionRate,
        presentToday: todayAttendance.filter(a => a.clockIn !== null).length,
        topPerformers: performerDetails,
        monthlyCompleted: monthlyTasks.filter(t => t.status === 'COMPLETED').length,
        monthlyPending: monthlyTasks.filter(t => t.status === 'PENDING').length,
    };
}

export default router;
