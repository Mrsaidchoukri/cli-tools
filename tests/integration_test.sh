#!/bin/bash

# Integration test script for cross-tool communication
# Uses search.sh to find files and process.py to process them

# Setup test environment
setup() {
    echo "Setting up test environment..."
    mkdir -p test_dir/subdir
    echo "Hello World" > test_dir/file1.txt
    echo "hello world" > test_dir/file2.txt
    echo "test@example.com" > test_dir/subdir/file3.txt
    echo "another.test@email.com" > test_dir/subdir/file4.txt
}

# Cleanup test environment
cleanup() {
    echo "Cleaning up test environment..."
    rm -rf test_dir
}

# Run integration tests
run_tests() {
    local failed=0
    local total=0

    # Test 1: Use search.sh to find .txt files and process.py to extract emails
    echo "Test 1: Find .txt files and extract emails"
    files=$(../file-search/search.sh test_dir ".txt" -n | grep ".txt$")
    ((total++))
    if [[ -z "$files" ]]; then
        echo "✗ Test 1 failed (no files found)"
        ((failed++))
    else
        echo "$files" | xargs -I {} cat {} | ../text-processor/process.py extract-emails > output.txt
        output=$(cat output.txt)
        if echo "$output" | grep -q "test@example.com" && echo "$output" | grep -q "another.test@email.com"; then
            echo "✓ Test 1 passed"
        else
            echo "✗ Test 1 failed (email extraction failed)"
            ((failed++))
        fi
    fi

    # Test 2: Use search.sh to find files with "hello" and process.py to count lines
    echo "Test 2: Find files with 'hello' and count lines"
    files=$(../file-search/search.sh test_dir "hello" -c -i | grep ".txt$")
    ((total++))
    if [[ -z "$files" ]]; then
        echo "✗ Test 2 failed (no files found)"
        ((failed++))
    else
        echo "$files" | xargs -I {} cat {} | ../text-processor/process.py line-count > output.txt
        output=$(cat output.txt)
        if [[ "$output" == "2" ]]; then
            echo "✓ Test 2 passed"
        else
            echo "✗ Test 2 failed (line count incorrect)"
            ((failed++))
        fi
    fi

    # Summary
    echo "-------------------"
    echo "Tests completed: $total"
    echo "Tests failed: $failed"
    echo "Tests passed: $((total - failed))"

    return $failed
}

# Main execution
echo "Starting integration tests..."
setup
run_tests
test_result=$?
cleanup
rm -f output.txt

exit $test_result

