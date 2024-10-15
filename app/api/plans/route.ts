import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Prisma Client configurado

export async function POST(req: Request) {
    try {
        const { name, maxTeams, maxMembersPerTeam, price } = await req.json();

        // Verifica se os dados estão completos
        if (!name || !maxTeams || !maxMembersPerTeam || !price) {
            return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
        }

        // Cria o novo plano no banco de dados
        const newPlan = await db.plan.create({
            data: {
                name,
                maxTeams,
                maxMembersPerTeam,
                price,
            },
        });

        return NextResponse.json(newPlan, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao criar o plano" }, { status: 500 });
    }
}
