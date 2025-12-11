import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'OWNER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await context.params;

        const leave = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                reviewerId: currentUser.id,
                reviewedAt: new Date(),
            },
        });

        return NextResponse.json({ leave, message: 'Leave approved' });
    } catch (error) {
        console.error('Approve leave error:', error);
        return NextResponse.json({ error: 'Failed to approve leave' }, { status: 500 });
    }
}
