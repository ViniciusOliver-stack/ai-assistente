import type { Metadata } from "next"
import "./globals.css"
import Provider from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { Poppins } from "next/font/google"
import { WebSocketProvider } from "./context/WebSocketContext"

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Rubnik | Agentes de IA",
  description:
    "Aumente suas conversões e melhore o atendimento ao cliente 24/7 com agentes de IA. Que entendem e interagem como humanos. ",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br">
      <body className={`${poppins.className} antialiased`}>
        <Toaster />
        <WebSocketProvider>
          <Provider>{children}</Provider>
        </WebSocketProvider>
      </body>
    </html>
  )
}
