"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookText } from 'lucide-react'

interface Template {
  id: number
  name: string
  description?: string
}

interface TemplateListProps {
  templates: Template[]
  onSelectTemplate: (template: Template) => void
}

export function TemplateList({ templates, onSelectTemplate }: TemplateListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select a Template</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/50"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg truncate" title={template.name}>
                {template.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {template.description || "Click to view documents"}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      {templates.length === 0 && (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No templates found in this workspace</p>
        </div>
      )}
    </div>
  )
}
