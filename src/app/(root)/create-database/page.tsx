import { fetchPages } from "@/app/actions";
import { CreateDatabaseForm } from "@/components/create-database-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateDatabaseWithJSONForm } from "@/components/create-database-with-JSON-form";

export const dynamic = "force-dynamic";

export default async function CreateDatabasePage() {
  const { success, data: pages, error } = await fetchPages();

  if (!success) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Database
        </h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              "Failed to fetch pages. Please check your Notion API key."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Database</h1>
      <Tabs defaultValue="with-json" className="w-full ">
        <div className="flex items-center justify-center">
          <TabsList className="w-96 rounded-full ">
            <TabsTrigger value="with-json" className="rounded-full">
              With JSON
            </TabsTrigger>
            <TabsTrigger value="base" className="rounded-full">
              Base
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="with-json">
          <CreateDatabaseWithJSONForm pages={pages ?? []} />
        </TabsContent>
        <TabsContent value="base">
          <CreateDatabaseForm pages={pages ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
