# CLI Tools Collection

This repository contains a collection of command-line tools for various system operations.

## Tools Included

### 1. File Search Tool
Location: `file-search/`
- Search files by name or content
- Support for case-sensitive and case-insensitive searches
- Includes test suite

Usage:
```bash
./search.sh [directory] [pattern] [options]
Options:
  -n, --name        : Search by filename
  -c, --content     : Search file contents
  -i, --ignore-case : Case insensitive search
  -h, --help        : Show this help message
```

### 2. Text Processor
Location: `text-processor/`
- Word frequency analysis
- Regular expression filtering
- Email extraction
- Line counting
- Unique word listing
- Includes test suite

Usage:
```bash
./process.py [operation] [options]
Operations:
  word-freq      : Count word frequencies
  regex-filter   : Filter lines by regex pattern
  extract-emails : Extract email addresses
  line-count     : Count lines
  unique-words   : List unique words
```

### 3. Performance Monitor
Location: `perf-monitor/`
- System statistics monitoring
- CPU usage tracking
- Memory usage monitoring
- Disk usage and I/O statistics

## Requirements
- Bash shell for file search
- C++ compiler for performance monitor
- Python 3.x for text processor (with pytest for testing)
## Testing
- File Search: Run `./test.sh` in the `file-search` directory.
- Text Processor: Run `python3 test_process.py` in the `text-processor` directory.
- Performance Monitor: Run `./test_system.sh` in the `perf-monitor/src` directory after compiling with `make`.
- Integration Test: Run `./integration_test.sh` in the `tests` directory to verify cross-tool communication.
- Stress Test: Run `./stress_test.sh` in the `tests` directory to test performance under load.
## Logging
- File Search Tool: Logs errors and actions to `file-search/search.log`.
- Text Processor: Logs errors and operations to `text-processor/process.log`.
## Known Limitations
- In WSL (especially WSL2), `/proc/diskstats` and disk usage stats may be incomplete, causing Test 3 in `test_system.sh` to be skipped.
- Stress Test 2 in `stress_test.sh` may require adjusted CPU load (`--cpu 1`) in WSL due to `/proc` access issues under heavy load.
- Permission changes (e.g., `chmod` on `/proc/stat`) are restricted in WSL, so Test 4 in `test_system.sh` tests crash resilience without modifying permissions.
## Installation
- Compile `system_monitor`: `cd perf-monitor/src && make`
- Set up `text-processor`: `cd text-processor && ./setup_venv.sh && source venv/bin/activate`

## Usage
- Search files: `./file-search/search.sh demo_dir "file" -n`
- Process text: `python3 text-processor/process.py line-count -i test.txt`
- Monitor system: `./perf-monitor/src/system_monitor`

## Testing
- Run tests: `./file-search/test.sh`, `python3 text-processor/test_process.py`, `./perf-monitor/src/test_system.sh`, `./tests/integration_test.sh`, `./tests/stress_test.sh`
=======
# cli-tools
CLI tools project including file search, text processor, and system monitor.

