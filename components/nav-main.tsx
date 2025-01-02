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
