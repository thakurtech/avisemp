import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().optional(),
    company: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = registerSchema.parse(body);

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });

        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create owner account
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: 'OWNER',
                designation: 'Owner',
                department: data.company || 'Executive',
            },
        });

        const token = generateToken(user.id);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                designation: user.designation,
                department: user.department,
            },
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
