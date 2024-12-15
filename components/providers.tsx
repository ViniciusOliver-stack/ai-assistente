"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { AppSidebar } from "./ui/app-sidebar"

// Componente separado para o conteúdo que precisa do useSession
const ProtectedContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const nomeUser = session?.user?.name?.split(" ")[0]

  if (pathname === "/auth" || pathname === "/") {
    return <main>{children}</main>
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-[90%] mx-auto">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <p>Olá, {nomeUser || "Seja bem-vindo! 👋"}!</p>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-[90%] mx-auto">
          <main className="flex-1 overflow-x-hidden overflow-y-auto py-6 w-full">
            {children}
          </main>
        </div>
      </SidebarInset>
    </div>
  )
}

// Componente Provider principal
const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <SidebarProvider>
        <ProtectedContent>{children}</ProtectedContent>
      </SidebarProvider>
    </SessionProvider>
  )
}

export default Provider
