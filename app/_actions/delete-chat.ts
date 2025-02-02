"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function DeleteChat(conversationId: string) {
    try {
        await db.message.deleteMany({
            where: {
                conversationId: conversationId
            },
        })

        await db.conversationParticipant.deleteMany({
            where: {
                conversationId: conversationId
            }
        })

        await db.conversation.delete({
            where: {
                id: conversationId
            }
        })

        revalidatePath("/agents")

        return {success: true}
    } catch (error) {
        return {success: false, error: "Failed to delete chat"}
    }
}