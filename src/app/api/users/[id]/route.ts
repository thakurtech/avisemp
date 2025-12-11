import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;

        // Optionally restrict viewing other users if needed, 
        // but current logic allows authenticated users to fetch details.

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                designation: true,
                department: true,
                avatar: true,
                status: true,
                joinDate: true,
                managerId: true,
                manager: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || currentUser.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { name, phone, designation, department, managerId, status, role } = body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                phone,
                designation,
                department,
                managerId,
                status,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                designation: true,
                department: true,
                status: true,
            },
        });

        return NextResponse.json({ user, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || currentUser.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await context.params;

        if (id === currentUser.id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
