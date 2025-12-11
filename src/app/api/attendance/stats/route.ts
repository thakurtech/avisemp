import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const records = await prisma.attendance.findMany({
            where: {
                userId: currentUser.id,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
        });

        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const halfDay = records.filter(r => r.status === 'HALF_DAY').length;

        let totalHours = 0;
        records.forEach(r => {
            if (r.clockIn && r.clockOut) {
                totalHours += (r.clockOut.getTime() - r.clockIn.getTime()) / (1000 * 60 * 60);
            }
        });

        return NextResponse.json({
            present,
            absent,
            halfDay,
            totalHours: totalHours.toFixed(1),
        });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
