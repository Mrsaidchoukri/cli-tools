#!/bin/bash

# File Search Tool
# Usage: ./search.sh [directory] [pattern] [options]
# Options:
#   -n, --name     : Search by filename
#   -c, --content  : Search file contents
#   -i, --ignore-case : Case insensitive search
#   -h, --help     : Show this help message

show_help() {
    echo "Usage: $0 [directory] [pattern] [options]"
    echo "Options:"
    echo "  -n, --name        : Search by filename"
    echo "  -c, --content     : Search file contents"
    echo "  -i, --ignore-case : Case insensitive search"
    echo "  -h, --help        : Show this help message"
    exit 0
}
# Logging function
log_file="search.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$log_file"
}
# Default values
search_dir=""
pattern=""
search_type="name"
ignore_case=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -n|--name)
            search_type="name"
            shift
            ;;
        -c|--content)
            search_type="content"
            shift
            ;;
        -i|--ignore-case)
            ignore_case="-i"
            shift
            ;;
        *)
            if [[ -z "$search_dir" ]]; then
                search_dir="$1"
            elif [[ -z "$pattern" ]]; then
                pattern="$1"
            fi
            shift
            ;;
    esac
done
log "Starting search in directory '$search_dir' with pattern '$pattern'"
# Set default directory if not provided
if [[ -z "$search_dir" ]]; then
    search_dir="."
fi

# Validate inputs
if [[ -z "$pattern" ]]; then
    echo "Error: Search pattern is required"
    log "Error: Search pattern is required"
    show_help
fi

if [[ ! -d "$search_dir" ]]; then
    echo "Error: Directory '$search_dir' does not exist"
    log "Error: Directory '$search_dir' does not exist"
    exit 1
fi

# Function to print matching files
print_matches() {
    local count=0
    while IFS= read -r file; do
        if [[ -n "$file" ]]; then
            echo "$file"
            ((count++))
        fi
    done
    echo "Found $count matching files"
}

# Perform search based on type
if [[ "$search_type" == "name" ]]; then
    if [[ -n "$ignore_case" ]]; then
        # Use find with case-insensitive name matching
        find "$search_dir" -type f -iname "*${pattern}*" 2>/dev/null | print_matches
    else
        # Use find with case-sensitive name matching
        find "$search_dir" -type f -name "*${pattern}*" 2>/dev/null | print_matches
    fi
else
    # Search file contents
    if [[ -n "$ignore_case" ]]; then
        # Use grep with case-insensitive content matching
        find "$search_dir" -type f -exec grep -l "$ignore_case" "$pattern" {} \; 2>/dev/null | print_matches
    else
        # Use grep with case-sensitive content matching
        find "$search_dir" -type f -exec grep -l "$pattern" {} \; 2>/dev/null | print_matches
    fi
fi 
