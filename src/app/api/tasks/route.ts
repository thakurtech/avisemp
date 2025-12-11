import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createTaskSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    deadline: z.string().optional(),
    assigneeId: z.string(),
});

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        const { role, id } = currentUser;
        let whereClause: any = {};

        if (role === 'EMPLOYEE') {
            whereClause.assigneeId = id;
        } else if (role === 'MANAGER') {
            const teamMembers = await prisma.user.findMany({
                where: { managerId: id },
                select: { id: true },
            });
            const teamIds = [id, ...teamMembers.map(m => m.id)];
            whereClause.assigneeId = { in: teamIds };
        }

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

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        return NextResponse.json({ error: 'Failed to get tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'OWNER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const data = createTaskSchema.parse(body);

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority || 'MEDIUM',
                deadline: data.deadline ? new Date(data.deadline) : null,
                assigneeId: data.assigneeId,
                createdById: currentUser.id,
            },
            include: {
                assignee: {
                    select: { id: true, name: true },
                },
            },
        });

        return NextResponse.json({ task, message: 'Task created successfully' }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Create task error:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
