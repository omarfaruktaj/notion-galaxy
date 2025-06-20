import { fetchDatabase, fetchDatabaseEntries } from "@/app/actions"
import { DatabaseView } from "@/components/database-view"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"



export default async function DatabasePage({  params}: {params: Promise<{id:string}>}) {
  const { id } = await params
  const { success: dbSuccess, data: database, error: dbError } = await fetchDatabase(id)
  const { success: entriesSuccess, data: entries, error: entriesError } = await fetchDatabaseEntries(id)

  if (!dbSuccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Database</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {dbError || "Failed to fetch database. Please check your Notion API key."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!entriesSuccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{database?.title?.[0]?.plain_text || "Untitled Database"}</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {entriesError || "Failed to fetch database entries. Please check your Notion API key."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{database.title?.[0]?.plain_text || "Untitled Database"}</h1>
      <DatabaseView database={database} entries={entries ?? []} />
    </div>
  )
}
