/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNewPage } from "@/app/actions"
import { toast } from "sonner"

interface CreatePageFormProps {
  pages: any[]
  onSuccess?: () => void
}

export function CreatePageForm({ pages, onSuccess }: CreatePageFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [parentPageId, setParentPageId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title || !parentPageId) {
      toast.error( "Missing information",{
        description: "Please provide a title and select a parent page.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createNewPage(parentPageId, title, content)

      if (result.success) {
        toast( "Page created",{
          description: "Your page has been created successfully.",
        })
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/")
        }
      } else {
        toast.error( "Error",{
          description: result.error || "Failed to create page.",
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Information</CardTitle>
          <CardDescription>Enter the basic information for your new page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input id="title" placeholder="Enter page title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                    {page.properties?.title?.title?.[0]?.plain_text || "Untitled Page"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">The page will be created as a child of this page.</p>
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
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title || !parentPageId} className="w-full">
            {isSubmitting ? "Creating..." : "Create Page"}
            {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
