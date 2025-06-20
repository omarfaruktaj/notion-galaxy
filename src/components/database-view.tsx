/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Pencil, Trash2, AlertCircle, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AddPageDialog } from "@/components/add-page-dialog"
import { toast } from "sonner"
import { EntryForm } from "./entry-form"
import { deleteExistingDatabaseEntry } from "@/app/actions"
import { extractValuesFromPage } from "@/lib/notion"

interface DatabaseViewProps {
  database: any
  entries: any[]
}

export function DatabaseView({ database, entries }: DatabaseViewProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<any>(null)
  const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false)

  const properties = database.properties || {}
  const propertyKeys = Object.keys(properties)

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return

    setIsDeleting(true)

    try {
      const result = await deleteExistingDatabaseEntry(entryToDelete.id, database.id)

      if (result.success) {
        toast( "Entry deleted",{
          description: "The database entry has been deleted successfully.",
        })
        setIsDeleteDialogOpen(false)
        router.refresh()
      } else {
        toast.error( "Error",{
          description: result.error || "Failed to delete entry.",
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error",{
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteDialog = (entry: any) => {
    setEntryToDelete(entry)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (entry: any) => {
    setEntryToEdit(entry)
    setIsEditDialogOpen(true)
  }

  const renderCellValue = (entry: any, propertyKey: string) => {
    const property = entry.properties[propertyKey]

    if (!property) return null

    switch (property.type) {
      case "title":
        return property.title.map((t: any) => t.plain_text).join("")
      case "rich_text":
        return property.rich_text.map((t: any) => t.plain_text).join("")
      case "number":
        return property.number !== null ? property.number : ""
      case "select":
        return property.select?.name || ""
      case "multi_select":
        return property.multi_select.map((s: any) => (
          <span
            key={s.id}
            className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs mr-1"
          >
            {s.name}
          </span>
        ))
      case "date":
        return property.date?.start || ""
      case "checkbox":
        return property.checkbox ? "✓" : "✗"
      case "url":
        return property.url ? (
          <a href={property.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {property.url}
          </a>
        ) : (
          ""
        )
      case "email":
        return property.email ? (
          <a href={`mailto:${property.email}`} className="text-blue-500 hover:underline">
            {property.email}
          </a>
        ) : (
          ""
        )
      case "phone_number":
        return property.phone_number || ""
      default:
        return "Unsupported"
    }
  }
  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Database Properties</CardTitle>
            <CardDescription>This database has {propertyKeys.length} properties.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
          <Button variant="outline" onClick={() => setIsAddPageDialogOpen(true)} className="ml-2">
            <FileText className="mr-2 h-4 w-4" />
            Add Page
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {propertyKeys.map((key) => (
              <div key={key} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">{key}</p>
                  <p className="text-sm text-muted-foreground">{properties[key].type}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Entries</CardTitle>
          <CardDescription>This database has {entries.length} entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No entries found. Add your first entry to get started.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {propertyKeys.map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      {propertyKeys.map((key) => (
                        <TableCell key={`${entry.id}-${key}`}>{renderCellValue(entry, key)}</TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(entry)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openDeleteDialog(entry)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Entry</DialogTitle>
            <DialogDescription>Create a new entry in this database.</DialogDescription>
          </DialogHeader>
          <EntryForm
            database={database}
            onSuccess={() => {
              setIsCreateDialogOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>Update this database entry.</DialogDescription>
          </DialogHeader>
          {entryToEdit && (
            <EntryForm
              database={database}
              entry={entryToEdit}
              initialValues={extractValuesFromPage(entryToEdit)}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>This will permanently delete the entry from your Notion database.</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntry} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Page Dialog */}
      <AddPageDialog
        isOpen={isAddPageDialogOpen}
        onClose={() => setIsAddPageDialogOpen(false)}
        parentId={database.parent?.page_id || ""}
      />
    </div>
  )
}
