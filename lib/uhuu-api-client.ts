const BASE_URL = "https://api.uhuu.io/v1"

// Type definitions
export interface Team {
  id: number
  name: string
  features?: Record<string, any>
  workspaces: WorkspaceInfo[]
}

export interface WorkspaceInfo {
  id: number
  name: string
}

export interface Workspace {
  id: number
  name: string
  team_id: number
  created_at: string
  updated_at: string
  templates: TemplateInfo[]
}

export interface TemplateInfo {
  id: number
  name: string
  description?: string | null
}

export interface Template {
  id: number
  name: string
  workspace_id: number
  integration_bind?: string
  remote_url?: string
  html?: string
  css?: string
  base_data?: Record<string, any>
  paper_size?: string
  settings?: Record<string, any>
  features?: Record<string, any>
  updated_at?: string
  sheet_mapping?: Record<string, any>
  integration?: Record<string, any>
}

export interface Document {
  id: string
  status: string
  url?: string
  created_at: string
  rendered_at?: string
  started_at?: number
  ended_at?: number
  duration?: number
  pdf_url?: string
  thumbnail_url?: string
  data?: Record<string, any>
}

export interface CreateDocumentRequest {
  id?: string
  [key: string]: any
}

export interface CreateDocumentResponse {
  id: string
  status: string
}

export interface IntegrationDataRequest {
  id: string
}

// API Client class
export class UhuuApiClient {
  private apiToken: string

  constructor(apiToken: string) {
    this.apiToken = this.cleanToken(apiToken)
  }

  private cleanToken(token: string): string {
    return token.trim().replace(/[^\x00-\x7F]/g, "")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid API token. Please check your token and try again.")
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Team API
  async getTeam(): Promise<Team> {
    return this.request<Team>("/team")
  }

  // Workspace API
  async getWorkspace(workspaceId: number): Promise<Workspace> {
    return this.request<Workspace>(`/workspaces/${workspaceId}`)
  }

  // Template API
  async getTemplate(templateId: number, fields?: string[]): Promise<Template> {
    const queryParams = fields ? `?fields=${fields.join(",")}` : ""
    return this.request<Template>(`/templates/${templateId}${queryParams}`)
  }

  async createDocument(templateId: number, data?: CreateDocumentRequest): Promise<CreateDocumentResponse> {
    return this.request<CreateDocumentResponse>(`/templates/${templateId}`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    })
  }

  async getTemplateDocuments(templateId: number): Promise<Document[]> {
    return this.request<Document[]>(`/templates/${templateId}/documents`)
  }

  async getIntegrationData(templateId: number, data: IntegrationDataRequest): Promise<Record<string, any>> {
    return this.request<Record<string, any>>(`/templates/${templateId}/integration`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Document API
  async getDocument(documentId: string, fields?: string[]): Promise<Document> {
    const queryParams = fields ? `?fields=${fields.join(",")}` : ""
    return this.request<Document>(`/documents/${documentId}${queryParams}`)
  }
}

// Factory function to create API client
export function createUhuuApiClient(apiToken: string): UhuuApiClient {
  return new UhuuApiClient(apiToken)
}
