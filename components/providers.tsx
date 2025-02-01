// components/providers.tsx
"use client"

import { useState, useEffect } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { AppSidebar } from "./ui/app-sidebar"
import { CheckAuthentication } from "./check-authentication"
import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "./ui/button"
import { usePreventDevTools } from "@/hooks/user-prevent-dev-tools"

const loadSleekPlanWidget = () => {
  if (typeof window !== "undefined" && !window.$sleek) {
    window.$sleek = []
    window.SLEEK_PRODUCT_ID = 407276291
    const script = document.createElement("script")
    script.src = "https://client.sleekplan.com/sdk/e.js"
    script.async = true
    document.head.appendChild(script)
  }
}

const ProtectedContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const nomeUser = session?.user?.name?.split(" ")[0]
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Lista de rotas onde o widget NÃO deve aparecer
  const excludedRoutes = ["/", "/auth", "/_not-found"]

  usePreventDevTools()

  useEffect(() => {
    setMounted(true)
    // Carrega o widget apenas se não estiver nas rotas excluídas
    if (!excludedRoutes.includes(pathname)) {
      loadSleekPlanWidget()
    }
  }, [pathname])

  if (pathname === "/auth" || pathname === "/") {
    return <>{children}</>
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-full w-full">
      <CheckAuthentication />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between px-4 w-[90%] mx-auto">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <p>Olá, {nomeUser || "Seja bem-vindo! 👋"}!</p>
            </div>

            <div>
              {theme === "light" ? (
                <Button
                  onClick={() => setTheme("dark")}
                  className="bg-transparent text-black dark:bg-transparent hover:bg-neutral-200 shadow-none"
                >
                  <SunIcon size="18" />
                </Button>
              ) : (
                <Button
                  onClick={() => setTheme("light")}
                  className="bg-transparent text-white dark:bg-transparent"
                >
                  <MoonIcon size="18" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col md:gap-4 md:p-4 pt-0 w-[90%] mx-auto">
          <main className="flex-1 overflow-x-hidden overflow-y-auto py-6 w-full">
            {children}
          </main>
        </div>
      </SidebarInset>
    </div>
  )
}

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
