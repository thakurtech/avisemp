import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const year = new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: currentUser.id,
                status: 'APPROVED',
                startDate: { gte: startOfYear, lte: endOfYear },
            },
        });

        const used = { casual: 0, sick: 0, earned: 0, unpaid: 0 };
        approvedLeaves.forEach(leave => {
            const days = Math.ceil(
                (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

            switch (leave.type) {
                case 'CASUAL': used.casual += days; break;
                case 'SICK': used.sick += days; break;
                case 'EARNED': used.earned += days; break;
                case 'UNPAID': used.unpaid += days; break;
            }
        });

        const balance = {
            casual: Math.max(0, 12 - used.casual),
            sick: Math.max(0, 12 - used.sick),
            earned: Math.max(0, 24 - used.earned),
        };

        return NextResponse.json({ balance, used });
    } catch (error) {
        console.error('Get leave balance error:', error);
        return NextResponse.json({ error: 'Failed to get balance' }, { status: 500 });
    }
}
