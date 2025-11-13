"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { createUhuuApiClient, type Template } from "@/lib/uhuu-api-client"

interface CreateDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiToken: string
  templateId: number
  onDocumentCreated: () => void
}

export function CreateDocumentDialog({
  open,
  onOpenChange,
  apiToken,
  templateId,
  onDocumentCreated,
}: CreateDocumentDialogProps) {
  const [templateData, setTemplateData] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const apiClient = createUhuuApiClient(apiToken)

  useEffect(() => {
    if (open && templateId) {
      loadTemplateData()
    }
  }, [open, templateId])

  const loadTemplateData = async () => {
    try {
      setLoadingTemplate(true)
      const data = await apiClient.getTemplate(templateId, ["base_data", "name"])
      setTemplateData(data)

      // Initialize form data with base_data structure
      if (data.base_data) {
        setFormData(JSON.parse(JSON.stringify(data.base_data)))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template data",
        variant: "destructive",
      })
    } finally {
      setLoadingTemplate(false)
    }
  }

  const updateFormData = (path: string[], value: any) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {}
        current = current[path[i]]
      }

      current[path[path.length - 1]] = value
      return newData
    })
  }

  const renderFormFields = (obj: any, path: string[] = []): React.ReactElement[] => {
    const fields: React.ReactElement[] = []

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key]
      const fieldId = currentPath.join(".")
      const label = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        fields.push(
          <div key={fieldId} className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
            <h4 className="font-semibold text-sm text-foreground">{label}</h4>
            <div className="space-y-4">{renderFormFields(value, currentPath)}</div>
          </div>,
        )
      } else {
        const currentValue = currentPath.reduce((acc, key) => acc?.[key], formData) ?? ""

        fields.push(
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {label}
            </Label>
            {typeof value === "string" && value.length > 50 ? (
              <Textarea
                id={fieldId}
                value={currentValue}
                onChange={(e) => updateFormData(currentPath, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                rows={3}
                className="resize-none"
              />
            ) : (
              <Input
                id={fieldId}
                value={currentValue}
                onChange={(e) => updateFormData(currentPath, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            )}
          </div>,
        )
      }
    }

    return fields
  }

  const handleCreate = async () => {
    try {
      setLoading(true)
      const result = await apiClient.createDocument(templateId, formData)

      toast({
        title: "Success",
        description: `Document created with status: ${result.status}`,
      })
      onOpenChange(false)
      onDocumentCreated()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create document",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="text-xl">Create New Document</SheetTitle>
          <SheetDescription className="text-sm">
            {templateData?.name && <span className="font-medium text-foreground">{templateData.name}</span>}
            {templateData?.name && " - "}
            Fill in the document data below
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {loadingTemplate ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading template data...</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-6 px-6 py-6">
                {templateData?.base_data ? (
                  renderFormFields(templateData.base_data)
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">No template data available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading || loadingTemplate} className="flex-1 sm:flex-none">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Document"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
