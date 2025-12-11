import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { role, id } = currentUser;

        if (role === 'EMPLOYEE') {
            return NextResponse.json(await getEmployeeStats(id));
        } else if (role === 'MANAGER') {
            return NextResponse.json(await getManagerStats(id));
        } else {
            return NextResponse.json(await getOwnerStats());
        }
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}

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
