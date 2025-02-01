"use client"
import { GraduationCap, LifeBuoyIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTrialStore } from "@/store/use-trial-store"
import TrialTimer from "./sections/trial-timer"
import { useEffect, useState } from "react"
import { GetUser } from "@/app/_actions/get-user"

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
]

export function NavMain() {
  const pathname = usePathname()
  const { trialStartDate, trialEndDate, isTrialExpired } = useTrialStore()
  const [hasActiveSub, setHasActiveSub] = useState(false)

  const isActiveRoute = (itemUrl: string) => {
    return pathname.startsWith(itemUrl)
  }

  useEffect(() => {
    const checkSub = async () => {
      const userData = await GetUser()
      setHasActiveSub(userData?.stripeSubscriptionStatus === "active")
    }
    checkSub()
  }, [])

  return (
    <>
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
          {trialStartDate && trialEndDate && !hasActiveSub && <TrialTimer />}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

export default NavMain
