#!/bin/bash

# Test script for file search tool
# Creates test files and directories, then runs various search scenarios

# Setup test environment
setup() {
    echo "Setting up test environment..."
    mkdir -p test_dir/subdir
    echo "Hello World" > test_dir/file1.txt
    echo "hello world" > test_dir/file2.txt
    echo "Testing" > test_dir/subdir/file3.txt
    echo "TESTING" > test_dir/subdir/file4.txt
}

# Cleanup test environment
cleanup() {
    echo "Cleaning up test environment..."
    rm -rf test_dir
}

# Run tests
run_tests() {
    local failed=0
    local total=0

    # Test 1: Search by filename
    echo "Test 1: Search by filename"
    output=$(./search.sh test_dir "file" -n)
    count=$(echo "$output" | grep -c "Found.*files")
    files=$(echo "$output" | grep -c "test_dir.*txt")
    ((total++))
    if [[ $count -eq 1 && $files -eq 4 ]]; then
        echo "✓ Test 1 passed"
    else
        echo "✗ Test 1 failed"
        ((failed++))
    fi

    # Test 2: Search by content (case sensitive)
    echo "Test 2: Search by content (case sensitive)"
    output=$(./search.sh test_dir "Hello" -c)
    count=$(echo "$output" | grep -c "Found.*files")
    files=$(echo "$output" | grep -c "test_dir/file1.txt")
    ((total++))
    if [[ $count -eq 1 && $files -eq 1 ]]; then
        echo "✓ Test 2 passed"
    else
        echo "✗ Test 2 failed"
        ((failed++))
    fi

    # Test 3: Search by content (case insensitive)
    echo "Test 3: Search by content (case insensitive)"
    output=$(./search.sh test_dir "testing" -c -i)
    count=$(echo "$output" | grep -c "Found.*files")
    files=$(echo "$output" | grep -c "test_dir/subdir/file")
    ((total++))
    if [[ $count -eq 1 && $files -eq 2 ]]; then
        echo "✓ Test 3 passed"
    else
        echo "✗ Test 3 failed"
        ((failed++))
    fi

    # Test 4: Invalid directory
    echo "Test 4: Invalid directory"
    ./search.sh nonexistent_dir "pattern" 2>&1 | grep -q "Error: Directory 'nonexistent_dir' does not exist"
    ((total++))
    if [[ $? -eq 0 ]]; then
        echo "✓ Test 4 passed"
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

# Main test execution
echo "Starting tests..."
setup
chmod +x search.sh
run_tests
test_result=$?
cleanup

exit $test_result 