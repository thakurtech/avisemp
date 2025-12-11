import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;

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
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task });
    } catch (error) {
        console.error('Get task error:', error);
        return NextResponse.json({ error: 'Failed to get task' }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'OWNER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { title, description, priority, deadline, assigneeId } = body;

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

        return NextResponse.json({ task, message: 'Task updated successfully' });
    } catch (error) {
        console.error('Update task error:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'OWNER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await context.params;

        await prisma.task.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
