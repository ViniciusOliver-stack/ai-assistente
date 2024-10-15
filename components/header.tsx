"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Title from "./ui/title"

interface HeaderProps {
  title: string
  description: string
}

export function Header({ title, description }: HeaderProps) {
  const pathname = usePathname()

  return (
    <div>
      <Title title={title} description={description} />

      <div>
        <ul className="flex items-center gap-6 mt-4 border-b border-b-neutral-700 mb-6">
          <li>
            <Link
              href="/config/profile"
              className={
                pathname === "/config/profile"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : ""
              }
            >
              Perfil
            </Link>
          </li>

          <li>
            <Link
              href="/config/team"
              className={
                pathname === "/config/team"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : ""
              }
            >
              Equipe
            </Link>
          </li>

          <li>
            <Link
              href="/config/billing"
              className={
                pathname === "/config/billing"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : ""
              }
            >
              Pagamento
            </Link>
          </li>

          <li>
            <Link
              href="/config/api-keys"
              className={
                pathname === "/config/api-keys"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : ""
              }
            >
              Chaves de API
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
