#!/bin/bash

# Stress test script for search.sh and system_monitor

# Setup large directory for stress testing
setup_large_dir() {
    echo "Setting up large directory for stress testing..."
    mkdir -p stress_dir
    for i in {1..1000}; do
        echo "Test file $i" > "stress_dir/file$i.txt"
        echo "hello world" >> "stress_dir/file$i.txt"
    done
}

# Cleanup stress test environment
cleanup() {
    echo "Cleaning up stress test environment..."
    rm -rf stress_dir
}

# Run stress tests
run_tests() {
    local failed=0
    local total=0

    # Stress Test 1: Search in a large directory
    echo "Stress Test 1: Search in a large directory with search.sh"
    start_time=$(date +%s)
    output=$(timeout 15 ../file-search/search.sh stress_dir "file" -n 2>&1)
    end_time=$(date +%s)
    elapsed=$((end_time - start_time))
    echo "Debug Output for Test 1: '$output'"
    ((total++))
    files=$(echo "$output" | grep -c "stress_dir/file.*txt")
    if [[ $files -eq 1000 && $elapsed -le 15 ]]; then
        echo "✓ Stress Test 1 passed (found 1000 files in $elapsed seconds)"
    else
        echo "✗ Stress Test 1 failed (found $files files in $elapsed seconds)"
    ((failed++))
    fi

    # Stress Test 2: Run system_monitor under CPU load
echo "Stress Test 2: Run system_monitor under CPU load"
if command -v stress >/dev/null; then
    stress --cpu 2 --timeout 20 &
    stress_pid=$!
    sleep 3 # Give stress more time to start
    output=$(timeout 15 ../perf-monitor/src/system_monitor 2>&1 | grep -E "CPU Usage:.*[0-9]|Memory Usage:" -m 1)
    kill $stress_pid 2>/dev/null
    echo "Debug Output for Test 2: '$output'"
    ((total++))
    if echo "$output" | grep -qE "CPU Usage:.*[0-9]|Memory Usage:"; then
        echo "✓ Stress Test 2 passed"
    else
        echo "✗ Stress Test 2 failed"
        ((failed++))
    fi
else
    echo "Warning: 'stress' not found, skipping Stress Test 2"
    ((total++))
fi
    # Summary
    echo "-------------------"
    echo "Tests completed: $total"
    echo "Tests failed: $failed"
    echo "Tests passed: $((total - failed))"

    return $failed
}

# Main execution
echo "Starting stress tests..."
setup_large_dir
run_tests
test_result=$?
cleanup

exit $test_result
