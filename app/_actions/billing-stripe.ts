// "use server"

//Verificar necessidade de uso

// import { authOptions } from "@/lib/auth"
// import { createCheckoutSession } from "@/services/stripe/stripe"
// import { getServerSession } from "next-auth"
// import { redirect } from "next/navigation"

// export async function createCheckoutSessionAction(priceId: string) {
//     const session = await getServerSession(authOptions)

//     if(!session?.user){
//         console.log("Usuário não autenticado")
//         return 
//     }

//     const checkoutSession = await createCheckoutSession(
//         session.user.id as string, 
//         session.user.email as string,
//         priceId // Usar o priceId correto aqui
//     )

//     if(!checkoutSession.url) return 

//     redirect(checkoutSession.url)
// }
