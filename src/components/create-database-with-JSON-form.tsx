/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createNewDatabaseWithJSON } from "@/app/actions";
import { Textarea } from "./ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

interface CreateDatabaseFormProps {
  pages: any[];
}

export function CreateDatabaseWithJSONForm({ pages }: CreateDatabaseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [parentPageId, setParentPageId] = useState("");
  interface Property {
    name: string;
    type: string;
    options?: { name: string }[];
  }

  const [properties, setProperties] = useState<Property[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setJsonInput(input);

    try {
      const parsed = JSON.parse(input);

      // Notion expects an object with property configurations
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setProperties(parsed);
        setJsonError(null);
      } else {
        setJsonError(
          "JSON must be an object mapping property names to Notion property types."
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setJsonError("Invalid JSON format.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !parentPageId) {
      toast.error("Missing information", {
        description: "Please provide a title and select a parent page.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createNewDatabaseWithJSON(
        title,
        properties,
        parentPageId
      );

      if (result.success) {
        toast("Database created", {
          description: "Your database has been created successfully.",
        });
        router.push("/");
      } else {
        toast.error("Error", {
          description: result.error || "Failed to create database.",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
          <CardDescription>
            Enter the basic information for your new database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Database Title</Label>
            <Input
              id="title"
              placeholder="Enter database title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent">Parent Page</Label>
            <Select value={parentPageId} onValueChange={setParentPageId}>
              <SelectTrigger id="parent">
                <SelectValue placeholder="Select a parent page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page: any) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.properties?.title?.title?.[0]?.plain_text ||
                      "Untitled Page"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              The database will be created as a child of this page.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Properties</CardTitle>
          <CardDescription>
            Define the properties (columns) for your database using JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="properties">Properties (Notion JSON Format)</Label>
            <Textarea
              id="properties"
              placeholder="Enter Notion-style properties. Example below."
              value={jsonInput}
              className="min-h-[200px] max-h-[400px] resize-none"
              onChange={handleJsonChange}
            />
            {jsonError && <p className="text-sm text-red-500">{jsonError}</p>}
            <p className="text-sm text-muted-foreground mt-1">
              Use Notion&apos;s property schema. For example:
            </p>
            <Accordion type="single" collapsible className="w-full">
  <AccordionItem value="json-example">
    <AccordionTrigger className="text-sm">Show example JSON</AccordionTrigger>
    <AccordionContent>
      <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">
{`{
  "Name": {
    "title": {}
  },
  "Status": {
    "select": {
      "options": [
        { "name": "To Do", "color": "red" },
        { "name": "In Progress", "color": "yellow" },
        { "name": "Done", "color": "green" }
      ]
    }
  },
  "Due Date": {
    "date": {}
  }
}`}
      </pre>
    </AccordionContent>
  </AccordionItem>
</Accordion>


          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !parentPageId || !!jsonError}
            className="w-full"
          >
            {isSubmitting ? "Creating..." : "Create Database"}
            {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
