import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(['MANAGER', 'EMPLOYEE']),
    designation: z.string().optional(),
    department: z.string().optional(),
    managerId: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { role, id } = currentUser;
        let whereClause = {};

        if (role === 'MANAGER') {
            whereClause = { managerId: id };
        } else if (role === 'EMPLOYEE') {
            whereClause = { id };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
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
                    select: { id: true, name: true },
                },
                _count: {
                    select: { assignedTasks: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || currentUser.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const data = createUserSchema.parse(body);

        const existing = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });

        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: data.role,
                designation: data.designation,
                department: data.department,
                managerId: data.managerId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                designation: true,
                department: true,
                managerId: true,
            },
        });

        return NextResponse.json({ user, message: 'User created successfully' }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
