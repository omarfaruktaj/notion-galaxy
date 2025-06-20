/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X, Save } from "lucide-react";
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
import { createNewDatabase } from "@/app/actions";

const PROPERTY_TYPES = [
  { value: "rich_text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multi_select", label: "Multi Select" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "phone_number", label: "Phone Number" },
];

interface CreateDatabaseFormProps {
  pages: any[];
}

export function CreateDatabaseForm({ pages }: CreateDatabaseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [parentPageId, setParentPageId] = useState("");
  interface Property {
    name: string;
    type: string;
    options?: { name: string }[];
  }

  const [properties, setProperties] = useState<Property[]>([]);
  const [currentProperty, setCurrentProperty] = useState<Property>({
    name: "",
    type: "",
  });
  const [selectOptions, setSelectOptions] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProperty = () => {
    if (!currentProperty.name || !currentProperty.type) return;

    const newProperty = { ...currentProperty };

    // Add options for select and multi_select types
    if (
      ["select", "multi_select"].includes(currentProperty.type) &&
      selectOptions.length > 0
    ) {
      newProperty.options = selectOptions.map((option) => ({ name: option }));
    }

    setProperties([...properties, newProperty]);
    setCurrentProperty({ name: "", type: "" });
    setSelectOptions([]);
    setCurrentOption("");
  };

  const removeProperty = (index: number) => {
    const newProperties = [...properties];
    newProperties.splice(index, 1);
    setProperties(newProperties);
  };

  const addOption = () => {
    if (!currentOption) return;
    setSelectOptions([...selectOptions, currentOption]);
    setCurrentOption("");
  };

  const removeOption = (index: number) => {
    const newOptions = [...selectOptions];
    newOptions.splice(index, 1);
    setSelectOptions(newOptions);
  };
  useEffect(() => {
    if (!parentPageId && pages.length > 0) {
      setParentPageId(pages[0].id);
    }
  }, [pages, parentPageId]);
  const handleSubmit = async () => {
    if (!title || !parentPageId) {
      toast.error("Missing information", {
        description: "Please provide a title and select a parent page.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createNewDatabase(title, properties, parentPageId);

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
            Define the properties (columns) for your database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {properties.map((property, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium">{property.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      PROPERTY_TYPES.find((t) => t.value === property.type)
                        ?.label
                    }
                    {property.options &&
                      ` (${property.options.length} options)`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProperty(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-name">Property Name</Label>
                <Input
                  id="property-name"
                  placeholder="e.g., Status, Priority"
                  value={currentProperty.name}
                  onChange={(e) =>
                    setCurrentProperty({
                      ...currentProperty,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property-type">Property Type</Label>
                <Select
                  value={currentProperty.type}
                  onValueChange={(value) =>
                    setCurrentProperty({ ...currentProperty, type: value })
                  }
                >
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {["select", "multi_select"].includes(currentProperty.type) && (
              <div className="space-y-4 border p-4 rounded-md">
                <Label>Options</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add an option"
                    value={currentOption}
                    onChange={(e) => setCurrentOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button type="button" onClick={addOption} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {option}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={addProperty}
              disabled={!currentProperty.name || !currentProperty.type}
              variant="outline"
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !parentPageId}
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
