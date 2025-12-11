import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Comment content required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                taskId: id,
                authorId: currentUser.id,
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error('Add comment error:', error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
