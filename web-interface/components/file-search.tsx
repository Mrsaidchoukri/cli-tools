"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function FileSearch() {
  const [directory, setDirectory] = useState(".")
  const [pattern, setPattern] = useState("")
  const [searchType, setSearchType] = useState("name")
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!pattern) {
      setError("Search pattern is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/file-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directory,
          pattern,
          searchType,
          ignoreCase,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search files")
      }

      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="directory">Directory</Label>
          <Input
            id="directory"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            placeholder="Enter directory path"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern">Search Pattern</Label>
          <Input
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter search pattern"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="name-search" checked={searchType === "name"} onCheckedChange={() => setSearchType("name")} />
          <Label htmlFor="name-search">Search by filename</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="content-search"
            checked={searchType === "content"}
            onCheckedChange={() => setSearchType("content")}
          />
          <Label htmlFor="content-search">Search file contents</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="ignore-case" checked={ignoreCase} onCheckedChange={(checked) => setIgnoreCase(!!checked)} />
          <Label htmlFor="ignore-case">Ignore case</Label>
        </div>
      </div>

      <Button onClick={handleSearch} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          "Search Files"
        )}
      </Button>

      {error && <p className="text-red-500">{error}</p>}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Search Results</h3>
          <Card className="p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-1">
              {results.map((file, index) => (
                <li key={index} className="text-sm">
                  {file}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">Found {results.length} matching files</p>
          </Card>
        </div>
      )}
    </div>
  )
}
