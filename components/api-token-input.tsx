"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Key } from 'lucide-react'

interface ApiTokenInputProps {
  onTokenSubmit: (token: string) => void
}

export function ApiTokenInput({ onTokenSubmit }: ApiTokenInputProps) {
  const [token, setToken] = useState("")
  const testToken = process.env.NEXT_PUBLIC_DEFAULT_UHUU_TOKEN

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      onTokenSubmit(token.trim())
    }
  }

  const handleUseTestToken = () => {
    if (testToken) {
      onTokenSubmit(testToken)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Key className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Uhuu API Playground</CardTitle>
              <CardDescription className="text-sm">Interactive API testing environment</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">API Bearer Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your Uhuu API token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your token is stored locally and never sent to any server except Uhuu API.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={!token.trim()}>
              Connect to API
            </Button>
            {testToken && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleUseTestToken}
              >
                Try with Test Token
              </Button>
            )}
          </form>
          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">About this playground:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Browse workspaces and templates</li>
              <li>Create and manage documents</li>
              <li>Test API endpoints interactively</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
