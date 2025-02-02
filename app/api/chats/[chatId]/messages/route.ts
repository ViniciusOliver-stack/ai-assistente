// app/api/chats/[chatId]/messages/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }

    // Get total count for pagination
    const totalMessages = await db.message.count({
      where: {
        conversationId: chatId,
      },
    })

    const messages = await db.message.findMany({
      where: {
        conversationId: chatId,
      },
      orderBy: {
        timestamp: "desc", // Changed to desc to get newest messages first
      },
      skip,
      take: limit,
    })

    const formattedMessages = messages.map(message => ({
      id: message.id,
      text: message.text,
      sender: message.sender === "DEFAULT_SENDER" ? "ai" : message.sender,
      timestamp: message.timestamp.toISOString(),
      messageTo: message.recipientId === "DEFAULT_RECIPIENT" ? null : message.recipientId,
      metadata: message.metadata
    }))

    return NextResponse.json({
      messages: formattedMessages,
      hasMore: skip + limit < totalMessages,
      total: totalMessages
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}