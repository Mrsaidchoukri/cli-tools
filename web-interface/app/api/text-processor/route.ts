import { exec } from "child_process"
import { promisify } from "util"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const execPromise = promisify(exec)

export async function POST(request: Request) {
  try {
    const { text, operation, pattern, caseSensitive } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Input text is required" }, { status: 400 })
    }

    if (operation === "regex-filter" && !pattern) {
      return NextResponse.json({ error: "Pattern is required for regex filtering" }, { status: 400 })
    }

    // Create a temporary file for the input text
    const tempFilePath = join("/tmp", `input-${randomUUID()}.txt`)
    await writeFile(tempFilePath, text)

    // Build the command
    let command = `python3 process.py ${operation}`

    if (operation === "regex-filter") {
      command += ` -p "${pattern}"`
    }

    if (caseSensitive) {
      command += " --case-sensitive"
    }

    command += ` -i "${tempFilePath}" --json`

    // Execute the command
    const { stdout, stderr } = await execPromise(command, {
      cwd: process.env.TEXT_PROCESSOR_PATH || "/path/to/text-processor",
    })

    if (stderr) {
      console.error("Error executing text processor command:", stderr)
      return NextResponse.json({ error: "Error executing text processor command" }, { status: 500 })
    }

    // Parse the results
    let results
    try {
      results = JSON.parse(stdout)
    } catch (e) {
      console.error("Error parsing text processor output:", e)
      results = stdout.trim()
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in text processor API:", error)
    return NextResponse.json({ error: "Failed to execute text processor command" }, { status: 500 })
  }
}
