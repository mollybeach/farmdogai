"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-xl font-bold">
        FarmDog AI
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </nav>
  )
} 