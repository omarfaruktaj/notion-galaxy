/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Database, FileText, AlertCircle, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchDatabases, fetchPages } from "@/app/actions"

export const dynamic = 'force-dynamic'
export const metadata = {
  title: "Home",
  description: "Your Notion workspace overview",
} 

export default async function Home() {
  const { success: dbSuccess, data: databases, error: dbError } = await fetchDatabases()
  const { success: pagesSuccess, data: pages, error: pagesError } = await fetchPages()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Notion Workspace</h1>
        <div className="flex gap-2">
          <Link href="/create-page">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </Link>
          <Link href="/create-database">
            <Button>
              <Database className="mr-2 h-4 w-4" />
              Create Database
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="databases">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="mt-6">
          {!dbSuccess && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {dbError || "Failed to fetch databases. Please check your Notion API key."}
              </AlertDescription>
            </Alert>
          )}

          {dbSuccess &&databases && databases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">No databases found</h2>
              <p className="text-muted-foreground mt-2 mb-6">Create your first Notion database to get started.</p>
              <Link href="/create-database">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Database
                </Button>
              </Link>
            </div>
          )}

          {dbSuccess && databases&& databases.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {databases.map((database: any) => (
                <Card key={database.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="truncate">{database.title?.[0]?.plain_text || "Untitled Database"}</CardTitle>
                    <CardDescription>{new Date(database.created_time).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(database.properties || {}).length} properties
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/database/${database.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Database
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          {!pagesSuccess && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {pagesError || "Failed to fetch pages. Please check your Notion API key."}
              </AlertDescription>
            </Alert>
          )}

          {pagesSuccess && pages&& pages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">No pages found</h2>
              <p className="text-muted-foreground mt-2 mb-6">Create your first Notion page to get started.</p>
              <Link href="/create-page">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Page
                </Button>
              </Link>
            </div>
          )}

          {pagesSuccess &&pages&& pages.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page: any) => (
                <Card key={page.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="truncate">
                      {page.properties?.title?.title?.[0]?.plain_text || "Untitled Page"}
                    </CardTitle>
                    <CardDescription>{new Date(page.created_time).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Last edited: {new Date(page.last_edited_time).toLocaleString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {page.url && (
                      <a href={page.url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" className="w-full">
                          Open in Notion
                        </Button>
                      </a>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
