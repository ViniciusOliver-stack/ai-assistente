// app/api/chats/[chatId]/messages/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }

    const messages = await db.message.findMany({
      where: {
        conversationId: chatId,
      },
      orderBy: {
        timestamp: "asc",
      },
    })

    console.log("Messages", messages)

    const formattedMessages = messages.map(message => ({
      id: message.id,
      text: message.text,
      sender: message.sender === "DEFAULT_SENDER" ? "ai" : message.sender,
      timestamp: message.timestamp.toISOString(),
      messageTo: message.recipientId === "DEFAULT_RECIPIENT" ? null : message.recipientId,
      metadata: message.metadata
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}