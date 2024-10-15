/*Fazendo a construção desse arquivo, você garante que cada vez que for 
compilado o seu código, não será feito mais de uma conexão com o Prisma, 
assim garantimos que não vamos abrir múltiplas conexões com o nosso DB*/

import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-unused-vars, no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  prisma = global.cachedPrisma
}

export const db = prisma
