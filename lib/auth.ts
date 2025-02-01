import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { db } from "./db";
import EmailProvider from "next-auth/providers/email";
import { Adapter } from "next-auth/adapters";
import nodemailer from "nodemailer";

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/auth",
        signOut: "/auth",
        error: "/auth",
        verifyRequest: "/auth",
        newUser: "/dashboard"
    },
    adapter: PrismaAdapter(db) as Adapter,
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                },
                secure: false,
                requireTLS: true,
                tls: {
                    rejectUnauthorized: false
                }
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: async ({
                identifier: email,
                url,
                provider: { server, from },
            }) => {
                const { host } = new URL(url);
                const transport = nodemailer.createTransport(server);
                
                const result = await transport.sendMail({
                    to: email,
                    from: from,
                    subject: `Login Rubnik`,
                    text: text({ url, host }),
                    html: html({ url, host, email }),
                });
                
                const failed = result.rejected.concat(result.pending).filter(Boolean);
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) não puderam ser enviados`);
                }
            },
        })
    ],
    callbacks: {
    async session({session, user}) {
        const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                planId: true,
                trialStartDate: true,
                trialEndDate: true,
            }
        });

        session.user = {
            ...session.user,
            id: user.id,
            planId: dbUser?.planId,
            trialStartDate: dbUser?.trialStartDate,
            trialEndDate: dbUser?.trialEndDate
        } as any;

        return session;
    }
    },
}

// Função para gerar o texto plano do email
function text({ url, host }: { url: string; host: string }) {
    return `Acesse o Rubnik\n${url}\n\n`;
}

// Função para gerar o HTML do email
function html({ url, host, email }: { url: string; host: string; email: string }) {
    const escapedEmail = `${email.replace(/\./g, "&#8203;.")}`;

    const backgroundColor = "#f9fafb";
    const textColor = "#444444";
    const mainBackgroundColor = "#ffffff";
    const buttonBackgroundColor = "#346df1";
    const buttonBorderColor = "#346df1";
    const buttonTextColor = "#ffffff";

    return `
<body style="background: ${backgroundColor};">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.svg" width="150" height="150" style="margin-bottom: 20px;">
            </td>
        </tr>
    </table>
    <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
            <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                Fazer login como <strong>${escapedEmail}</strong>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}">
                            <a href="${url}" target="_blank" style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">
                                Acessar
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0px 0px 10px 0px; font-size: 12px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                Se você não solicitou este email, você pode ignorá-lo com segurança.
            </td>
        </tr>
    </table>
</body>
`;
}