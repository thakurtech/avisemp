import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const body = await request.json();
        const { status } = body;

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const task = await prisma.task.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ task, message: 'Task status updated' });
    } catch (error) {
        console.error('Update task status error:', error);
        return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
    }
}
