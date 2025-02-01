import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await getServerSession(authOptions)

    if (!session?.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const trialStartDate = new Date()
        const trialEndDate = new Date(trialStartDate)
        trialEndDate.setDate(trialStartDate.getDate() + 2) //Adiciona dois dias à data de início

        const updatedUser = await db.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                trialStartDate,
                trialEndDate,
            }
        })

        return NextResponse.json({
            trialStartDate: updatedUser.trialStartDate,
            trialEndDate: updatedUser.trialEndDate
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
        
    }
}