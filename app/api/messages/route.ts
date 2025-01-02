import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const instanceId = searchParams.get('instanceId');
    const teamId = searchParams.get('teamId');
    const agentId = searchParams.get('agentId');

    if(!instanceId || !teamId || !agentId) {
        return new Response('Missing required parameters', { status: 400 });
    }

    try {
        // First try to find by instanceId since it's unique
        const instance = await db.whatsAppInstance.findFirst({
            where: {
                instanceId,
                AND: [
                    { teamId },
                    { agentId }
                ]
            },
            select: {
                instanceName: true,
                team: {
                    select: { id: true }
                },
                agent: {
                    select: { id: true }
                }
            }
        });

        if(!instance) {
            // Log the actual values for debugging
            console.log("Search params:", { instanceId, teamId, agentId });
            
            // Check if instance exists with any of these parameters
            const possibleInstances = await db.whatsAppInstance.findMany({
                where: {
                    OR: [
                        { instanceId },
                        { teamId },
                        { agentId }
                    ]
                },
                select: {
                    instanceId: true,
                    teamId: true,
                    agentId: true
                }
            });
            
            console.log("Possible instances found:", possibleInstances);
            return new Response('Instance not found', { status: 404 });
        }

        const conversations = await db.conversation.findMany({
            where: {
                instanceWhatsApp: instance.instanceName,
            },
            include: {
                messages: {
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            },
            orderBy: {
                lastActivity: 'desc'
            },
        });

        const messages = conversations.flatMap(conv => conv.messages);
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error Fetching Messages: ", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}