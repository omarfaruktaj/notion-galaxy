/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { createNewDatabaseEntry, updateExistingDatabaseEntry } from "@/app/actions"
import { toast } from "sonner"

interface EntryFormProps {
  database: any
  entry?: any
  initialValues?: any
  onSuccess: () => void
}

export function EntryForm({ database, entry, initialValues = {}, onSuccess }: EntryFormProps) {
  const [values, setValues] = useState<any>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const properties = database.properties || {}

  const handleInputChange = (key: string, value: any) => {
    setValues({ ...values, [key]: value })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      let result

      if (entry) {
        // Update existing entry
        result = await updateExistingDatabaseEntry(entry.id, database.id, properties, values)
      } else {
        // Create new entry
        result = await createNewDatabaseEntry(database.id, properties, values)
      }

      if (result.success) {
        toast( entry ? "Entry updated" : "Entry created",{
          description: entry
            ? "The database entry has been updated successfully."
            : "A new entry has been added to the database.",
        })
        onSuccess()
      } else {
        toast.error( "Error",{
          description: result.error || `Failed to ${entry ? "update" : "create"} entry.`,
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error( "Error",{
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFormField = (key: string, property: any) => {
    const value = values[key]

    switch (property.type) {
      case "title":
      case "rich_text":
        return property.type === "title" ? (
          <Input
            value={value || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        ) : (
          <Textarea
            value={value || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        )
      case "number":
        return (
          <Input
            type="number"
            value={value !== undefined ? value : ""}
            onChange={(e) =>
              handleInputChange(key, e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
            }
            placeholder={`Enter ${key}`}
          />
        )
      case "select":
        return (
          <Select value={value || ""} onValueChange={(newValue) => handleInputChange(key, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {property.select.options.map((option: any) => (
                <SelectItem key={option.id} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "multi_select":
        // For simplicity, we'll use a comma-separated input for multi-select
        // In a real app, you might want a more sophisticated UI component
        return (
          <Input
            value={Array.isArray(value) ? value.join(", ") : ""}
            onChange={(e) => {
              const inputValue = e.target.value
              const values = inputValue
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v !== "")
              handleInputChange(key, values)
            }}
            placeholder={`Enter ${key} (comma-separated)`}
          />
        )
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleInputChange(key, date ? format(date, "yyyy-MM-dd") : undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      case "checkbox":
        return <Checkbox checked={Boolean(value)} onCheckedChange={(checked) => handleInputChange(key, checked)} />
      case "url":
      case "email":
      case "phone_number":
        return (
          <Input
            type={property.type === "email" ? "email" : "text"}
            value={value || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        )
      default:
        return <div>Unsupported property type: {property.type}</div>
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(properties).map(([key, property]: [string, any]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{key}</Label>
          {renderFormField(key, property)}
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onSuccess} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : entry ? "Update Entry" : "Create Entry"}
        </Button>
      </div>
    </div>
  )
}
