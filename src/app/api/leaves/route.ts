import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createLeaveSchema = z.object({
    type: z.enum(['CASUAL', 'SICK', 'EARNED', 'UNPAID']),
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().min(5),
});

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const { role, id } = currentUser;
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

        return NextResponse.json({ leaves });
    } catch (error) {
        console.error('Get leaves error:', error);
        return NextResponse.json({ error: 'Failed to get leaves' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const data = createLeaveSchema.parse(body);

        const leave = await prisma.leaveRequest.create({
            data: {
                type: data.type,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                reason: data.reason,
                employeeId: currentUser.id,
            },
            include: {
                employee: {
                    select: { id: true, name: true },
                },
            },
        });

        return NextResponse.json({ leave, message: 'Leave request submitted' }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Create leave error:', error);
        return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
    }
}
