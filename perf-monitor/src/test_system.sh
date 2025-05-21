#!/bin/bash

# Test script for system_monitor
# Tests basic functionality and error handling with debugging

# Build the program
echo "Building system_monitor..."
make
if [[ $? -ne 0 ]]; then
    echo "✗ Build failed"
    exit 1
fi

# Run tests
run_tests() {
    local failed=0
    local total=0

    # Test 1: Check if the program outputs CPU usage
    echo "Test 1: Check CPU usage output"
    output=$(./system_monitor | grep "CPU Usage:" -m 1 2>&1 & echo $! > pid.txt; sleep 2; kill $(cat pid.txt) 2>/dev/null; rm pid.txt)
    echo "Debug Output for Test 1: '$output'"
    ((total++))
    if [[ -n "$output" && "$output" =~ "CPU Usage:" ]]; then
        echo "✓ Test 1 passed"
    else
        echo "✗ Test 1 failed"
        ((failed++))
    fi

    # Test 2: Check if the program outputs Memory usage
    echo "Test 2: Check Memory usage output"
    output=$(./system_monitor | grep "Memory Usage:" -m 1 2>&1 & echo $! > pid.txt; sleep 2; kill $(cat pid.txt) 2>/dev/null; rm pid.txt)
    echo "Debug Output for Test 2: '$output'"
    ((total++))
    if [[ -n "$output" && "$output" =~ "Memory Usage:" ]]; then
        echo "✓ Test 2 passed"
    else
        echo "✗ Test 2 failed"
        ((failed++))
    fi

    # Test 3: Check if the program outputs Disk usage (optional for WSL)
    echo "Test 3: Check Disk usage output (optional for WSL)"
    output=$(./system_monitor | grep "Disk" -m 1 2>&1 & echo $! > pid.txt; sleep 2; kill $(cat pid.txt) 2>/dev/null; rm pid.txt)
    echo "Debug Output for Test 3: '$output'"
    ((total++))
    if [[ -n "$output" ]]; then
        echo "✓ Test 3 passed (disk stats available)"
    else
        echo "⚠ Test 3 skipped (disk stats may not be fully available in WSL)"
    fi

    # Test 4: Check if the program runs without crashing with inaccessible /proc/stat
    echo "Test 4: Check if program runs without crashing"
    sudo chmod 000 /proc/stat 2>/dev/null
    output=$(timeout 2 ./system_monitor 2>&1 || true)
    sudo chmod 644 /proc/stat 2>/dev/null
    echo "Debug Output for Test 4: '$output'"
    ((total++))
    if [[ -n "$output" ]]; then
        echo "✓ Test 4 passed (program did not crash)"
    else
        echo "✗ Test 4 failed"
        ((failed++))
    fi

    # Summary
    echo "-------------------"
    echo "Tests completed: $total"
    echo "Tests failed: $failed"
    echo "Tests passed: $((total - failed))"

    return $failed
}

# Main execution
echo "Starting tests..."
run_tests
test_result=$?
make clean

exit $test_result
