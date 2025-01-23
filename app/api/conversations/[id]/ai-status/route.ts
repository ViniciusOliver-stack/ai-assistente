// app/api/conversations/[id]/ai-status/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { isAIEnabled } = await request.json();
    const conversationId = params.id;

    const updatedConversation = await db.conversation.update({
      where: { id: conversationId },
      data: { isAIEnabled }
    });

    return NextResponse.json({
        id: updatedConversation.id,
        isAIEnabled: updatedConversation.isAIEnabled
      });
  } catch (error) {
    console.error('Error updating AI status:', error);
    return NextResponse.json(
      { error: 'Failed to update AI status' },
      { status: 500 }
    );
  }
}