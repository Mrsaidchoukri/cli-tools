#!/usr/bin/env python3

import argparse
import sys
import re
from collections import Counter
from typing import TextIO, Dict, List, Optional
import json

import logging

# Configure logging
logging.basicConfig(
    filename='process.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class TextProcessor:
    def __init__(self):
        self.operations = {
            'word-freq': self.word_frequency,
            'regex-filter': self.regex_filter,
            'extract-emails': self.extract_emails,
            'line-count': self.line_count,
            'unique-words': self.unique_words
        }

    def word_frequency(self, text: str, case_sensitive: bool = False) -> Dict[str, int]:
        """Count frequency of each word in the text."""
        # Split text into words, excluding email addresses
        words = []
        for line in text.splitlines():
            # Skip lines with email addresses
            if '@' in line:
                continue
            # Extract words from the line
            if case_sensitive:
                line_words = re.findall(r'\b[A-Z][a-z]*\b|\b[a-z]+\b', line)
            else:
                line = line.lower()
                line_words = re.findall(r'\b[a-z]+\b', line)
            words.extend(line_words)
        
        return dict(Counter(words))

    def regex_filter(self, text: str, pattern: str, case_sensitive: bool = True) -> List[str]:
        """Filter lines matching the regex pattern."""
        flags = 0 if case_sensitive else re.IGNORECASE
        # Only match complete words, excluding email addresses
        word_pattern = r'\b' + re.escape(pattern) + r'\b(?![@\w])'
        return [line for line in text.splitlines() if re.search(word_pattern, line, flags)]

    def extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text."""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return re.findall(email_pattern, text)

    def line_count(self, text: str, non_empty: bool = True) -> int:
        """Count lines in text, optionally excluding empty lines."""
        if non_empty:
            return len([line for line in text.splitlines() if line.strip()])
        return len(text.splitlines())

    def unique_words(self, text: str, case_sensitive: bool = False) -> List[str]:
        """Get list of unique words in text."""
        # Use word_frequency to get unique words
        return sorted(self.word_frequency(text, case_sensitive).keys())

def process_input(file: Optional[TextIO] = None) -> str:
    """Read input from file or stdin."""
    if file:
        return file.read()
    return sys.stdin.read()

def main():


    parser = argparse.ArgumentParser(description='Text processing utility')
    parser.add_argument('operation', choices=['word-freq', 'regex-filter', 'extract-emails', 
                                            'line-count', 'unique-words'],
                       help='Operation to perform')
    parser.add_argument('-i', '--input', type=argparse.FileType('r'),
                       help='Input file (default: stdin)')
    parser.add_argument('-o', '--output', type=argparse.FileType('w'),
                       help='Output file (default: stdout)')
    parser.add_argument('-p', '--pattern', help='Regex pattern for filtering')
    parser.add_argument('--case-sensitive', action='store_true',
                       help='Enable case-sensitive processing')
    parser.add_argument('--json', action='store_true',
                       help='Output in JSON format')

    args = parser.parse_args()
    processor = TextProcessor()
    logging.info(f"Starting operation '{args.operation}' with input from {args.input or 'stdin'}")

    # Read input
    text = process_input(args.input)

    # Process based on operation
    if args.operation == 'word-freq':
        result = processor.word_frequency(text, args.case_sensitive)
    elif args.operation == 'regex-filter':
        if not args.pattern:
            logging.error('regex-filter operation requires --pattern')
            parser.error('regex-filter operation requires --pattern')

        result = processor.regex_filter(text, args.pattern, args.case_sensitive)
    elif args.operation == 'extract-emails':
        result = processor.extract_emails(text)
    elif args.operation == 'line-count':
        result = processor.line_count(text)
    else:  # unique-words
        result = processor.unique_words(text, args.case_sensitive)

    # Format output
    output = json.dumps(result, indent=2) if args.json else str(result)
    
    # Write output
    if args.output:
        args.output.write(output + '\n')
    else:
        print(output)

if __name__ == '__main__':
    main() 
