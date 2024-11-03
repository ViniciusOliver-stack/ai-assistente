"use client"

import { SessionProvider } from "next-auth/react"
import { usePathname } from "next/navigation"
import Sidebar from "./sidebar"

const Provider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  return (
    <SessionProvider>
      {pathname !== "/auth" && pathname !== "/" ? (
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* <Header /> */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto px-9 py-6 w-full">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </SessionProvider>
  )
}

export default Provider
