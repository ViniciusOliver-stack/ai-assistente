import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { HomeIcon, Menu, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { ButtonSignOut } from "./ui/button-signout"

export function SidebarMobile() {
  return (
    <aside className="block md:hidden">
      <Sheet>
        <SheetTrigger>
          <Menu size={22} />
        </SheetTrigger>
        <SheetContent className="bg-zinc-900 border-none flex flex-col justify-between">
          <div>
            <div className="py-5">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Symplus">Symplus</SelectItem>
                  <SelectItem value="Suporte 5 estrelas">
                    Suporte 5 estrelas
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <nav>
              <SheetClose
                className="flex items-center gap-2 p-2 text-gray-300 hover:bg-neutral-600 text-sm rounded-md"
                asChild
              >
                <Link href="/app">
                  <HomeIcon size={18} />
                  Início
                </Link>
              </SheetClose>

              <SheetClose
                className="flex items-center gap-2 p-2 text-gray-300 hover:bg-neutral-600 text-sm rounded-md"
                asChild
              >
                <Link href="/config">
                  <SettingsIcon size={18} />
                  Configurações
                </Link>
              </SheetClose>
            </nav>
          </div>

          <footer className="flex items-center justify-between">
            <ButtonSignOut />
          </footer>
        </SheetContent>
      </Sheet>
    </aside>
  )
}
