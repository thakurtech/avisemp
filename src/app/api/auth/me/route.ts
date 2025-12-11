import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                designation: true,
                department: true,
                avatar: true,
                joinDate: true,
                status: true,
                managerId: true,
                manager: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get me error:', error);
        return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }
}
