"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createNewPage } from "@/app/actions"

interface AddPageDialogProps {
  isOpen: boolean
  onClose: () => void
  parentId: string
}

export function AddPageDialog({ isOpen, onClose, parentId }: AddPageDialogProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title) {
      toast.error("Missing information",{
        description: "Please provide a title for the page.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createNewPage(parentId, title, content)

      if (result.success) {
        toast("Page created",{
          description: "Your page has been created successfully.",
        })
        setTitle("")
        setContent("")
        onClose()
        router.refresh()
      } else {
        toast.error("Error",{
          description: result.error || "Failed to create page.",
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error",{
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Page</DialogTitle>
          <DialogDescription>Create a new page in your Notion workspace.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input id="title" placeholder="Enter page title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Page Content (Optional)</Label>
            <Textarea
              id="content"
              placeholder="Enter page content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title}>
            {isSubmitting ? "Creating..." : "Create Page"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
