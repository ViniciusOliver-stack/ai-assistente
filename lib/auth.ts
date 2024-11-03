import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { db } from "./db";
import EmailProvider from "next-auth/providers/email";
import { Adapter } from "next-auth/adapters";
import { createStripeCustomer } from "@/services/stripe/stripe";

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/auth",
        signOut: "/auth",
        error: "/auth",
        verifyRequest: "/auth",
        newUser: "/app"
    },
    adapter: PrismaAdapter(db) as Adapter,
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: parseInt(process.env.EMAIL_SERVER_PORT as string, 10),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM
        })
    ],
    callbacks: {
        async session({session, user}) {
            session.user = {
                ...session.user,
                id: user.id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any

            return session
        }
    },
    events: {
        createUser: async (message) => {
            await createStripeCustomer({
                name: message.user.name as string, 
                email: message.user.email as string,
            })
        }
    }
}