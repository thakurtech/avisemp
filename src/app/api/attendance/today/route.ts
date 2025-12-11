import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const today = getTodayDate();

        const record = await prisma.attendance.findFirst({
            where: {
                userId: currentUser.id,
                date: today,
            },
        });

        return NextResponse.json({
            isClockedIn: record?.clockIn !== null && record?.clockOut === null,
            clockIn: record?.clockIn,
            clockOut: record?.clockOut,
            status: record?.status || null,
        });
    } catch (error) {
        console.error('Get today attendance error:', error);
        return NextResponse.json({ error: 'Failed to get attendance' }, { status: 500 });
    }
}
