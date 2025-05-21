#!/bin/bash

# Demonstration script for CLI tools project

# Step 1: Setup test environment
echo "Step 1: Setting up test environment..."
mkdir -p demo_dir
echo "Contact: alice@example.com" > demo_dir/email1.txt
echo "Contact: bob@example.com" > demo_dir/email2.txt
echo "No email here" > demo_dir/note.txt

# Step 2: Run integration test (search.sh + process.py)
echo "Step 2: Running integration test..."
echo "Finding .txt files and extracting emails..."
files=$(file-search/search.sh demo_dir ".txt" -n | grep ".txt$")
if [[ -z "$files" ]]; then
    echo "No .txt files found!"
    exit 1
fi
echo "Files found:"
echo "$files"
echo "Extracting emails from these files..."
emails=$(echo "$files" | xargs -I {} cat {} | text-processor/process.py extract-emails)
echo "Emails extracted:"
echo "$emails"

# Step 3: Run system_monitor in the background
echo "Step 3: Starting system_monitor to observe resource usage..."
perf-monitor/system_monitor &
monitor_pid=$!
sleep 2  # Let it run for 2 seconds to show output
kill $monitor_pid 2>/dev/null
wait $monitor_pid 2>/dev/null

# Step 4: Simulate an error to show logging
echo "Step 4: Simulating an error to show logging..."
file-search/search.sh nonexistent_dir "pattern" 2>&1
echo "Checking the log file (file-search/search.log)..."
tail -n 2 file-search/search.log

# Step 5: Cleanup
echo "Step 5: Cleaning up..."
rm -rf demo_dir

echo "Demonstration complete!"
