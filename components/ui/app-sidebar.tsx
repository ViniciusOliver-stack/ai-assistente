"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import TeamSwitcher from "./team-switch"
import Image from "next/image"
import NavMain from "../nav-main"
import NavUser from "../nav-user"
import NavSuporte from "../nav-suporte"
import { useTheme } from "next-themes"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme } = useTheme()

  const getLogoSrc = () => {
    switch (theme) {
      case "light":
        return "/logo.svg"
      case "dark":
        return "/logo-white.svg"
      default:
        return "/logo.svg"
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Image
          src={getLogoSrc()}
          alt="Logo"
          width={120}
          height={120}
          className="pl-2 mb-2"
        />
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <NavSuporte />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
