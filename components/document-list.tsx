"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ExternalLink, RefreshCw, Loader2, BookText } from 'lucide-react'
import { createUhuuApiClient, type Document, type Template } from "@/lib/uhuu-api-client"

interface DocumentListProps {
  apiToken: string
  templateId: number
  refreshTrigger?: number
  template?: Template
}

const formatDate = (date: string | number | undefined): string => {
  if (!date) return "N/A"
  const timestamp = typeof date === "number" ? date / 1000 : date
  return new Date(timestamp).toLocaleString()
}

export function DocumentList({ apiToken, templateId, refreshTrigger, template }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const apiClient = createUhuuApiClient(apiToken)

  useEffect(() => {
    loadDocuments()

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setDocuments((currentDocs) => {
        const hasProcessingDocs = currentDocs.some((doc) => doc.status === "rendering" || doc.status === "awaiting")
        if (hasProcessingDocs) {
          loadDocuments()
        }
        return currentDocs
      })
    }, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [templateId, refreshTrigger])

  const loadDocuments = async () => {
    try {
      if (documents.length === 0) {
        setLoading(true)
      }
      const data = await apiClient.getTemplateDocuments(templateId)
      setDocuments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDocuments()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ready":
        return "default"
      case "rendering":
      case "awaiting":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading && documents.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {template && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <BookText className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">{template.name}</h3>
              </div>
              {template.description && <p className="text-sm text-muted-foreground">{template.description}</p>}
            </div>
            <Badge variant="outline" className="shrink-0">
              Template ID: {template.id}
            </Badge>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
          <p className="text-sm text-muted-foreground">Manage your generated documents</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {documents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <Card key={document.id} className="flex flex-col transition-colors hover:border-border">
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/30">
                      {document.status === "rendering" || document.status === "awaiting" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="truncate text-base font-medium">Doc {document.id.slice(-8)}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {formatDate(document.updated_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(document.status)} className="shrink-0">
                    {document.status === "rendering" || document.status === "awaiting" ? (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
                        {document.status}
                      </span>
                    ) : (
                      document.status
                    )}
                  </Badge>
                </div>
              </CardHeader>
              {document.status === "ready" && (document.pdf_url || document.url) && (
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                      <a href={document.pdf_url || document.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm font-medium">No documents yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create your first document to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}
