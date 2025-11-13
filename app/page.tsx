"use client"

import { useState } from "react"
import { ApiTokenInput } from "@/components/api-token-input"
import { DocumentManager } from "@/components/document-manager"

export default function Page() {
  const [apiToken, setApiToken] = useState<string>("")
  const [isTokenSet, setIsTokenSet] = useState(false)

  const handleTokenSubmit = (token: string) => {
    setApiToken(token)
    setIsTokenSet(true)
  }

  const handleResetToken = () => {
    setApiToken("")
    setIsTokenSet(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {!isTokenSet ? (
        <ApiTokenInput onTokenSubmit={handleTokenSubmit} />
      ) : (
        <DocumentManager apiToken={apiToken} onResetToken={handleResetToken} />
      )}
    </main>
  )
}
