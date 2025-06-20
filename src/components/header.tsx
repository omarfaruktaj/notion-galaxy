import Link from "next/link"
import { Database, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./node-toggle"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <span className="font-bold">Notion Database Manager</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/create-page">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </Link>
          <Link href="/create-database">
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Create Database
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
