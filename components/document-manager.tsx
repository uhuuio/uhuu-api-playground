"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TemplateList } from "@/components/template-list"
import { DocumentList } from "@/components/document-list"
import { CreateDocumentDialog } from "@/components/create-document-dialog"
import { LogOut, FileText, AlertCircle, Folder } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createUhuuApiClient, type Team, type Workspace, type Template } from "@/lib/uhuu-api-client"

interface DocumentManagerProps {
  apiToken: string
  onResetToken: () => void
}

export function DocumentManager({ apiToken, onResetToken }: DocumentManagerProps) {
  const [teamInfo, setTeamInfo] = useState<Team | null>(null)
  const [workspaces, setWorkspaces] = useState<
    Workspace["templates"] extends any[] ? Workspace["templates"][0][] : never
  >([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [documentRefreshTrigger, setDocumentRefreshTrigger] = useState(0)

  const apiClient = createUhuuApiClient(apiToken)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      setError(null)

      const teamData = await apiClient.getTeam()
      setTeamInfo(teamData)
      setWorkspaces(teamData.workspaces || [])

      if (teamData.workspaces && teamData.workspaces.length === 1) {
        handleWorkspaceSelect(teamData.workspaces[0].id)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load team data"
      setError(errorMessage)
      console.error("Error loading team data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkspaceSelect = async (workspaceId: number) => {
    try {
      const workspaceData = await apiClient.getWorkspace(workspaceId)
      setSelectedWorkspace(workspaceData)
      setSelectedTemplate(null)
    } catch (error) {
      console.error("Error loading workspace:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={loadTeamData} variant="outline" className="flex-1 bg-transparent">
              Retry
            </Button>
            <Button onClick={onResetToken} className="flex-1">
              Change Token
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold">Uhuu Documents</h1>
              {selectedWorkspace ? (
                <p className="text-sm text-muted-foreground">
                  {teamInfo?.name} / <span className="font-medium text-foreground">{selectedWorkspace.name}</span>
                </p>
              ) : (
                teamInfo && <p className="text-sm text-muted-foreground">{teamInfo.name}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onResetToken}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {workspaces.length > 1 && !selectedTemplate ? (
            <div className="mb-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => handleWorkspaceSelect(workspace.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedWorkspace?.id === workspace.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Folder className="h-4 w-4" />
                    {workspace.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            {!selectedWorkspace ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">Select a workspace to view templates</p>
              </div>
            ) : !selectedTemplate ? (
              <TemplateList
                templates={selectedWorkspace.templates || []}
                onSelectTemplate={(template) => setSelectedTemplate(template)}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Back to Templates
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>Create New Document</Button>
                </div>
                <DocumentList
                  apiToken={apiToken}
                  templateId={selectedTemplate.id}
                  refreshTrigger={documentRefreshTrigger}
                  template={selectedTemplate}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateDocumentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        apiToken={apiToken}
        templateId={selectedTemplate?.id || 0}
        onDocumentCreated={() => {
          setIsCreateDialogOpen(false)
          setDocumentRefreshTrigger((prev) => prev + 1)
        }}
      />
    </div>
  )
}
