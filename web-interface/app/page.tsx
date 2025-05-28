"use client"

import { useState, useEffect } from "react"
import "./styles.css" // We'll create this file for basic styling

export default function Home() {
  const [activeTab, setActiveTab] = useState("file-search")

  return (
    <div className="container">
      <header>
        <h1>CLI Tools Interface</h1>
        <p>Manage your system with powerful command-line tools</p>
      </header>

      <div className="tabs">
        <button className={activeTab === "file-search" ? "active" : ""} onClick={() => setActiveTab("file-search")}>
          File Search
        </button>
        <button
          className={activeTab === "system-monitor" ? "active" : ""}
          onClick={() => setActiveTab("system-monitor")}
        >
          System Monitor
        </button>
        <button
          className={activeTab === "text-processor" ? "active" : ""}
          onClick={() => setActiveTab("text-processor")}
        >
          Text Processor
        </button>
      </div>

      <div className="content">
        {activeTab === "file-search" && <FileSearch />}
        {activeTab === "system-monitor" && <SystemMonitor />}
        {activeTab === "text-processor" && <TextProcessor />}
      </div>
    </div>
  )
}

function FileSearch() {
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

      setResults(Array.isArray(data.results) ? data.results : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>File Search Tool</h2>
      <p>Search for files by name or content with various options</p>

      <div className="form-group">
        <label>Directory</label>
        <input
          type="text"
          value={directory}
          onChange={(e) => setDirectory(e.target.value)}
          placeholder="Enter directory path"
        />
      </div>

      <div className="form-group">
        <label>Search Pattern</label>
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter search pattern"
        />
      </div>

      <div className="form-group">
        <div className="radio-group">
          <label>
            <input type="radio" checked={searchType === "name"} onChange={() => setSearchType("name")} />
            Search by filename
          </label>

          <label>
            <input type="radio" checked={searchType === "content"} onChange={() => setSearchType("content")} />
            Search file contents
          </label>
        </div>

        <label className="checkbox">
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
          Ignore case
        </label>
      </div>

      <button onClick={handleSearch} disabled={loading} className="primary-button">
        {loading ? "Searching..." : "Search Files"}
      </button>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="results">
          <h3>Search Results</h3>
          <ul>
            {results.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
          <p className="result-count">Found {results.length} matching files</p>
        </div>
      )}
    </div>
  )
}

function SystemMonitor() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/system-stats")

      if (!response.ok) {
        throw new Error("Failed to fetch system stats")
      }

      const data = await response.json()
      setStats(data)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Fix the useEffect hook
  useEffect(() => {
    fetchStats()

    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(fetchStats, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh]) // Add dependency array with autoRefresh

  if (loading) {
    return <div className="loading">Loading system stats...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  const getStatusClass = (percentage: number) => {
    if (percentage < 50) return "low"
    if (percentage < 80) return "medium"
    return "high"
  }

  return (
    <div>
      <h2>System Monitor</h2>
      <p>Monitor system statistics like CPU, memory, and disk usage</p>

      <div className="button-group">
        <button onClick={() => setAutoRefresh(!autoRefresh)} className={autoRefresh ? "active" : ""}>
          {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
        </button>
        <button onClick={fetchStats}>Refresh Now</button>
      </div>

      {stats && stats.source && (
        <div className="note">
          <p>
            <strong>Note:</strong>{" "}
            {stats.source === "mock-data"
              ? "Displaying mock system data. No system information could be retrieved."
              : stats.source === "built-in-commands"
                ? "Using built-in Linux commands for system monitoring."
                : "Using custom system monitor."}
          </p>
          {stats.source === "mock-data" && (
            <p>
              Set the SYSTEM_MONITOR_PATH and SYSTEM_MONITOR_COMMAND environment variables to use your actual system
              monitor.
            </p>
          )}
        </div>
      )}

      {stats && (
        <div className="stats">
          <div className="stat-card">
            <h3>CPU Usage</h3>
            <div>
              <div className="stat-label">
                <span>Overall: {stats.cpu.usage.toFixed(1)}%</span>
                <span className={getStatusClass(stats.cpu.usage)}>
                  {stats.cpu.usage < 50 ? "Low" : stats.cpu.usage < 80 ? "Moderate" : "High"}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress ${getStatusClass(stats.cpu.usage)}`}
                  style={{ width: `${stats.cpu.usage}%` }}
                ></div>
              </div>
            </div>

            {Array.isArray(stats.cpu.cores) &&
              stats.cpu.cores.map((usage: number, index: number) => (
                <div key={index}>
                  <div className="stat-label">
                    <span>
                      Core {index}: {usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress ${getStatusClass(usage)}`} style={{ width: `${usage}%` }}></div>
                  </div>
                </div>
              ))}
          </div>

          <div className="stat-card">
            <h3>Memory Usage</h3>
            <div className="stat-label">
              <span>
                {stats.memory.used.toFixed(1)} GB / {stats.memory.total.toFixed(1)} GB
              </span>
              <span className={getStatusClass(stats.memory.percent)}>{stats.memory.percent.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress ${getStatusClass(stats.memory.percent)}`}
                style={{ width: `${stats.memory.percent}%` }}
              ></div>
            </div>
          </div>

          {Array.isArray(stats.disks) && stats.disks.length > 0 && (
            <div className="stat-card">
              <h3>Disk Usage</h3>
              {stats.disks.map((disk: any, index: number) => (
                <div key={index}>
                  <div className="stat-label">
                    <span>{disk.device}</span>
                    <span className={getStatusClass(disk.percent)}>
                      {disk.used.toFixed(1)} GB / {disk.total.toFixed(1)} GB ({disk.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress ${getStatusClass(disk.percent)}`}
                      style={{ width: `${disk.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TextProcessor() {
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

    // Debug: Log the results to see what we're getting
    console.log("Results:", results, "Type:", typeof results, "Is Array:", Array.isArray(results))

    if (operation === "word-freq") {
      // Handle word frequency results (should be an object)
      if (typeof results === "object" && !Array.isArray(results)) {
        return (
          <div className="results">
            <h3>Word Frequency</h3>
            <ul>
              {Object.entries(results).map(([word, count]: [string, any]) => (
                <li key={word}>
                  <span>{word}</span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      } else {
        return (
          <div className="error">Invalid word frequency data format. Expected an object, got: {typeof results}</div>
        )
      }
    }

    if (operation === "extract-emails") {
      // Handle email extraction results (should be an array)
      const emailArray = Array.isArray(results) ? results : []
      return (
        <div className="results">
          <h3>Extracted Emails</h3>
          {emailArray.length > 0 ? (
            <>
              <ul>
                {emailArray.map((email: string, index: number) => (
                  <li key={index}>{String(email)}</li>
                ))}
              </ul>
              <p className="result-count">Found {emailArray.length} email addresses</p>
            </>
          ) : (
            <p className="result-count">No email addresses found</p>
          )}
        </div>
      )
    }

    if (operation === "regex-filter") {
      // Handle regex filter results (should be an array)
      const filteredArray = Array.isArray(results) ? results : []
      return (
        <div className="results">
          <h3>Filtered Lines</h3>
          {filteredArray.length > 0 ? (
            <>
              <ul>
                {filteredArray.map((line: string, index: number) => (
                  <li key={index}>{String(line)}</li>
                ))}
              </ul>
              <p className="result-count">Found {filteredArray.length} matching lines</p>
            </>
          ) : (
            <p className="result-count">No matching lines found</p>
          )}
        </div>
      )
    }

    if (operation === "line-count") {
      // Handle line count results (should be a number)
      return (
        <div className="results line-count">
          <h3>Line Count</h3>
          <div className="count">{String(results)}</div>
          <p>Total Lines</p>
        </div>
      )
    }

    if (operation === "unique-words") {
      // Handle unique words results (should be an array)
      const wordsArray = Array.isArray(results) ? results : []
      return (
        <div className="results">
          <h3>Unique Words</h3>
          {wordsArray.length > 0 ? (
            <>
              <div className="tags">
                {wordsArray.map((word: string, index: number) => (
                  <span key={index} className="tag">
                    {String(word)}
                  </span>
                ))}
              </div>
              <p className="result-count">Found {wordsArray.length} unique words</p>
            </>
          ) : (
            <p className="result-count">No unique words found</p>
          )}
        </div>
      )
    }

    return <div className="error">Unknown operation or invalid results format. Results: {JSON.stringify(results)}</div>
  }

  return (
    <div>
      <h2>Text Processor</h2>
      <p>Process text with various operations like word frequency, regex filtering, email extraction</p>

      <div className="form-group">
        <label>Input Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to process"
          rows={6}
        />
      </div>

      <div className="form-group">
        <label>Operation</label>
        <div className="radio-group">
          <label>
            <input type="radio" checked={operation === "word-freq"} onChange={() => setOperation("word-freq")} />
            Word Frequency
          </label>
          <label>
            <input type="radio" checked={operation === "regex-filter"} onChange={() => setOperation("regex-filter")} />
            Regex Filter
          </label>
          <label>
            <input
              type="radio"
              checked={operation === "extract-emails"}
              onChange={() => setOperation("extract-emails")}
            />
            Extract Emails
          </label>
          <label>
            <input type="radio" checked={operation === "line-count"} onChange={() => setOperation("line-count")} />
            Line Count
          </label>
          <label>
            <input type="radio" checked={operation === "unique-words"} onChange={() => setOperation("unique-words")} />
            Unique Words
          </label>
        </div>
      </div>

      {operation === "regex-filter" && (
        <div className="form-group">
          <label>Regex Pattern</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern"
          />
        </div>
      )}

      <label className="checkbox">
        <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
        Case Sensitive
      </label>

      <button onClick={handleProcess} disabled={loading} className="primary-button">
        {loading ? "Processing..." : "Process Text"}
      </button>

      {error && <div className="error">{error}</div>}

      {renderResults()}
    </div>
  )
}
