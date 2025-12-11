import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const now = new Date();

        const existing = await prisma.attendance.findFirst({
            where: {
                userId: currentUser.id,
                date: today,
            },
        });

        if (!existing || !existing.clockIn) {
            return NextResponse.json({ error: 'Not clocked in today' }, { status: 400 });
        }

        if (existing.clockOut) {
            return NextResponse.json({ error: 'Already clocked out' }, { status: 400 });
        }

        const record = await prisma.attendance.update({
            where: { id: existing.id },
            data: { clockOut: now },
        });

        const hours = (now.getTime() - existing.clockIn.getTime()) / (1000 * 60 * 60);

        return NextResponse.json({
            record,
            message: 'Clocked out successfully',
            hoursWorked: hours.toFixed(2),
        });
    } catch (error) {
        console.error('Clock out error:', error);
        return NextResponse.json({ error: 'Failed to clock out' }, { status: 500 });
    }
}
