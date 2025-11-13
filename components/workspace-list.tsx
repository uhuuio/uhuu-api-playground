"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder } from "lucide-react"
import { cn } from "@/lib/utils"

interface Workspace {
  id: number
  name: string
}

interface WorkspaceListProps {
  workspaces: Workspace[]
  selectedWorkspaceId: number | null
  onSelectWorkspace: (id: number) => void
}

export function WorkspaceList({ workspaces, selectedWorkspaceId, onSelectWorkspace }: WorkspaceListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Workspaces</h2>
      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <Card
            key={workspace.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent hover:border-primary/30",
              selectedWorkspaceId === workspace.id && "border-primary bg-accent",
            )}
            onClick={() => onSelectWorkspace(workspace.id)}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{workspace.name}</CardTitle>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      {workspaces.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">No workspaces found</p>
        </div>
      )}
    </div>
  )
}
