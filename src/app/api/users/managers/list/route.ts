import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const managers = await prisma.user.findMany({
            where: { role: 'MANAGER' },
            select: { id: true, name: true, email: true, department: true },
        });

        return NextResponse.json({ managers });
    } catch (error) {
        console.error('Get managers error:', error);
        return NextResponse.json({ error: 'Failed to get managers' }, { status: 500 });
    }
}
