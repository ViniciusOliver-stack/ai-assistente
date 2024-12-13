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
    <div className="mb-8">
      <Title title={title} description={description} />

      <nav className="mt-6">
        <ul className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
          {[
            { href: "/config/profile", label: "Perfil" },
            { href: "/config/team", label: "Equipe" },
            { href: "/config/billing", label: "Pagamento" },
            { href: "/config/api-keys", label: "Chaves de API" },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`inline-block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  pathname === href
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
