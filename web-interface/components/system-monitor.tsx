"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TextProcessor() {
  const [inputText, setInputText] = useState("")
  const [operation, setOperation] = useState("word-freq")
  const [pattern, setPattern] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleProcess = async () => {
    if (!inputText) {
      setError("Input text is required")
      return
    }

    if (operation === "regex-filter" && !pattern) {
      setError("Pattern is required for regex filtering")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/text-processor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          operation,
          pattern,
          caseSensitive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process text")
      }

      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const renderResults = () => {
    if (!results) return null

    if (operation === "word-freq") {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Word Frequency</h3>
          <Card className="p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-1">
              {Object.entries(results).map(([word, count]: [string, any]) => (
                <li key={word} className="text-sm">
                  {word}: {count}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )
    }

    if (operation === "extract-emails") {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Extracted Emails</h3>
          <Card className="p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-1">
              {results.map((email: string, index: number) => (
                <li key={index} className="text-sm">
                  {email}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">Found {results.length} email addresses</p>
          </Card>
        </div>
      )
    }

    if (operation === "regex-filter") {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Filtered Lines</h3>
          <Card className="p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-1">
              {results.map((line: string, index: number) => (
                <li key={index} className="text-sm">
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">Found {results.length} matching lines</p>
          </Card>
        </div>
      )
    }

    if (operation === "line-count") {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Line Count</h3>
          <Card className="p-4">
            <p className="text-lg font-medium">{results} lines</p>
          </Card>
        </div>
      )
    }

    if (operation === "unique-words") {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Unique Words</h3>
          <Card className="p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-1">
              {results.map((word: string, index: number) => (
                <li key={index} className="text-sm">
                  {word}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">Found {results.length} unique words</p>
          </Card>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="input-text">Input Text</Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to process"
          className="min-h-32"
        />
      </div>

      <div className="space-y-2">
        <Label>Operation</Label>
        <RadioGroup value={operation} onValueChange={setOperation} className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="word-freq" id="word-freq" />
            <Label htmlFor="word-freq">Word Frequency</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="regex-filter" id="regex-filter" />
            <Label htmlFor="regex-filter">Regex Filter</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="extract-emails" id="extract-emails" />
            <Label htmlFor="extract-emails">Extract Emails</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="line-count" id="line-count" />
            <Label htmlFor="line-count">Line Count</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unique-words" id="unique-words" />
            <Label htmlFor="unique-words">Unique Words</Label>
          </div>
        </RadioGroup>
      </div>

      {operation === "regex-filter" && (
        <div className="space-y-2">
          <Label htmlFor="pattern">Regex Pattern</Label>
          <Input
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="case-sensitive"
          checked={caseSensitive}
          onCheckedChange={(checked) => setCaseSensitive(!!checked)}
        />
        <Label htmlFor="case-sensitive">Case Sensitive</Label>
      </div>

      <Button onClick={handleProcess} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Process Text"
        )}
      </Button>

      {error && <p className="text-red-500">{error}</p>}

      {renderResults()}
    </div>
  )
}
