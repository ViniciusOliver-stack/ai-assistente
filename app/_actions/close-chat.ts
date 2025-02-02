"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function CloseChat(conversationId: string) {
  // console.log("Starting closeChat action for conversationId:", conversationId)
  
  try {
    const updatedConversation = await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    })

    // console.log("Chat closed successfully:", updatedConversation)
    
    revalidatePath("/agents")
    return { 
      success: true, 
      data: updatedConversation 
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Detailed error in closeChat:", {
      error: error,
      message: error.message,
      stack: error.stack
    })
    
    return { 
      success: false, 
      error: error.message || "Failed to close chat",
      details: error 
    }
  }
}