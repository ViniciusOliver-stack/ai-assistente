"use client"
import { GraduationCap, LifeBuoyIcon, Send } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"

const navigationItems = [
  {
    title: "Tutoriais",
    url: "/dashboard",
    icon: GraduationCap,
  },
  {
    title: "Suporte",
    url: "/agents",
    icon: LifeBuoyIcon,
  },
  {
    title: "Feedback",
    url: "/config/profile",
    icon: Send,
  },
]

export function NavMain() {
  const pathname = usePathname()

  const isActiveRoute = (itemUrl: string) => {
    return pathname.startsWith(itemUrl)
  }

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupLabel>Ajuda</SidebarGroupLabel>
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
