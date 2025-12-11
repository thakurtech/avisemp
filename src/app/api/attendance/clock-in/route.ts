import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const today = getTodayDate();
        const now = new Date();

        const existing = await prisma.attendance.findFirst({
            where: {
                userId: currentUser.id,
                date: today,
            },
        });

        if (existing) {
            if (existing.clockIn && !existing.clockOut) {
                return NextResponse.json({ error: 'Already clocked in' }, { status: 400 });
            }
            if (existing.clockOut) {
                return NextResponse.json({ error: 'Already completed for today' }, { status: 400 });
            }
        }

        const record = await prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId: currentUser.id,
                    date: today,
                },
            },
            create: {
                userId: currentUser.id,
                date: today,
                clockIn: now,
                status: 'PRESENT',
            },
            update: {
                clockIn: now,
                status: 'PRESENT',
            },
        });

        return NextResponse.json({
            record,
            message: 'Clocked in successfully',
            clockIn: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        });
    } catch (error) {
        console.error('Clock in error:', error);
        return NextResponse.json({ error: 'Failed to clock in' }, { status: 500 });
    }
}
