import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { handleSubscriptionChange } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if(!session?.user) {
        return new Response("Unauthorized", {status: 401})
    }

    const {priceId} = await req.json()

    try {
        // Buscar informações completas do usuário
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
            stripeCustomerId: true,
            stripeSubscriptionId: true
            }
        });

        // Tenta atualizar assinatura existente
        const existingSubscription = await handleSubscriptionChange(
            session.user.id,
            priceId
        );

        // Se existe uma assinatura e foi atualizada, redireciona para o dashboard
        if (existingSubscription) {
            return NextResponse.json({
            url: `${process.env.NEXTAUTH_URL}/success`,
            });
        }

        // Configuração da sessão de checkout
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXTAUTH_URL}/success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/config/billing`,
            metadata: {
                userId: session.user.id,
            }
        };

        // Usar customer existente se disponível
        if (user?.stripeCustomerId) {
            sessionParams.customer = user.stripeCustomerId;
        } else {
            // Criar novo customer apenas durante o checkout
            sessionParams.customer_email = session.user.email!;
        }

        const stripeSession = await stripe.checkout.sessions.create({
            ...sessionParams,
            metadata: {
                userId: session.user.id,
                priceId: priceId
            }
        });

          return NextResponse.json({ url: stripeSession.url });
    } catch(error) {
        // console.log("Internal Error: ", error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}