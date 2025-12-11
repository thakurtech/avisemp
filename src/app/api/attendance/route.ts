import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        const { role, id } = currentUser;
        let whereClause: any = {};

        if (role === 'EMPLOYEE') {
            whereClause.userId = id;
        } else if (role === 'MANAGER') {
            const teamMembers = await prisma.user.findMany({
                where: { managerId: id },
                select: { id: true },
            });
            const teamIds = [id, ...teamMembers.map(m => m.id)];
            whereClause.userId = { in: teamIds };
        }

        if (month && year) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0);
            whereClause.date = { gte: startDate, lte: endDate };
        }

        const records = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
            orderBy: { date: 'desc' },
        });

        return NextResponse.json({ records });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json({ error: 'Failed to get attendance' }, { status: 500 });
    }
}
