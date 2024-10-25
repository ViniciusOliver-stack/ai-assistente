"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function getListAgents(selectedTeamId: string) {
    const user = await getServerSession(authOptions);

    if (!user) {
        throw new Error("Usuário não autenticado para obter os agentes!");
    }

    const listAgents = await db.agent.findMany({
        where: {
            teamId: selectedTeamId,
        },
    });

    if (!listAgents) {
        return [];
    }

    return listAgents;
}
