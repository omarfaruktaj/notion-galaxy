import { fetchPages } from "@/app/actions"
import { CreatePageForm } from "@/components/create-page-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CreatePagePage() {
  const { success, data: pages, error } = await fetchPages()

  if (!success) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Failed to fetch pages. Please check your Notion API key."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
      <CreatePageForm pages={pages||[]} />
    </div>
  )
}
