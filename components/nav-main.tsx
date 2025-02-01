"use client"
import { HomeIcon, SettingsIcon, User } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTrialStore } from "@/store/use-trial-store"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { SkeletonLoader } from "./animations/skeleton-loader"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Agentes",
    url: "/agents",
    icon: User,
  },
  {
    title: "Configurações",
    url: "/config/profile",
    icon: SettingsIcon,
  },
]

export function NavMain() {
  const pathname = usePathname()
  const { isTrialExpired, isTrialStarted, checkTrialStatus } = useTrialStore()
  const { data: session } = useSession()
  const [hasActiveSub, setHasActiveSub] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/user/subscription-status")
        const { isActive } = await response.json()
        setHasActiveSub(isActive)
      } catch (error) {
        console.error("Error checking subscription:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
    const interval = setInterval(checkSubscription, 300000) // Verifica a cada 5 minutos
    return () => clearInterval(interval)
  }, [])

  // Atualiza o estado se a sessão mudar
  useEffect(() => {
    if (session?.user) {
      useTrialStore.getState().syncWithServer(session.user)
    }
  }, [session])

  if (loading) {
    return (
      <div className="px-3">
        <SkeletonLoader />
      </div>
    )
  }

  const shouldShowNav = hasActiveSub || (isTrialStarted && !isTrialExpired)
  if (!shouldShowNav) return null

  // Não mostra a navegação se o trial não foi iniciado ou expirou
  if (!shouldShowNav) return null

  const isActiveRoute = (itemUrl: string) => {
    // Verifica se o itemUrl é "/config/profile" e se o pathname atual começa com "/config/"
    if (itemUrl === "/config/profile") {
      return pathname.startsWith("/config/")
    } else {
      return pathname.startsWith(itemUrl)
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navigationItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              className={isActiveRoute(item.url) ? "text-blue-500" : ""}
            >
              <Link href={item.url} className="flex items-center gap-2">
                {item.icon && <item.icon size={18} />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default NavMain
