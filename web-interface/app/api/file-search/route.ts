import { exec } from "child_process"
import { promisify } from "util"
import { NextResponse } from "next/server"

const execPromise = promisify(exec)

export async function POST(request: Request) {
  try {
    const { directory, pattern, searchType, ignoreCase } = await request.json()

    if (!pattern) {
      return NextResponse.json({ error: "Search pattern is required" }, { status: 400 })
    }

    // Build the command
    let command = `./search.sh "${directory}" "${pattern}"`

    if (searchType === "content") {
      command += " -c"
    } else {
      command += " -n"
    }

    if (ignoreCase) {
      command += " -i"
    }

    // Execute the command
    const { stdout, stderr } = await execPromise(command, {
      cwd: process.env.SEARCH_TOOL_PATH || "/path/to/file-search",
    })

    if (stderr) {
      console.error("Error executing search command:", stderr)
      return NextResponse.json({ error: "Error executing search command" }, { status: 500 })
    }

    // Parse the results
    const lines = stdout.split("\n").filter(Boolean)
    const results = lines.filter((line) => !line.includes("Found") && !line.includes("Error:"))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in file search API:", error)
    return NextResponse.json({ error: "Failed to execute search command" }, { status: 500 })
  }
}
