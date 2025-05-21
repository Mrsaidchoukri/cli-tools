#!/usr/bin/env python3

import pytest
from process import TextProcessor

@pytest.fixture
def processor():
    return TextProcessor()

@pytest.fixture
def sample_text():
    return """Hello World!
This is a test file.
Hello again, world.
test@example.com
another.test@email.com
This is another TEST line.
"""

def test_word_frequency(processor, sample_text):
    # Test case-sensitive
    result = processor.word_frequency(sample_text, case_sensitive=True)
    assert result['Hello'] == 2  # "Hello" appears twice in case-sensitive mode
    assert 'hello' not in result  # lowercase 'hello' should not be counted in case-sensitive mode
    
    # Test case-insensitive
    result = processor.word_frequency(sample_text, case_sensitive=False)
    assert result['hello'] == 2  # 'hello' appears twice when case-insensitive
    assert result['test'] == 2  # 'test' appears twice when case-insensitive

def test_regex_filter(processor, sample_text):
    # Test case-sensitive
    result = processor.regex_filter(sample_text, 'test', case_sensitive=True)
    assert len(result) == 1  # Only "test file" line should match
    assert 'test file' in result[0]
    
    # Test case-insensitive
    result = processor.regex_filter(sample_text, 'test', case_sensitive=False)
    assert len(result) == 2  # Both "test file" and "TEST line" should match
    assert any('TEST line' in line for line in result)

def test_extract_emails(processor, sample_text):
    result = processor.extract_emails(sample_text)
    assert len(result) == 2
    assert 'test@example.com' in result
    assert 'another.test@email.com' in result

def test_line_count(processor, sample_text):
    # Test with non-empty lines
    result = processor.line_count(sample_text, non_empty=True)
    assert result == 6
    
    # Test with empty lines
    text_with_empty = sample_text + '\n\n'
    result = processor.line_count(text_with_empty, non_empty=False)
    assert result == 8

def test_unique_words(processor, sample_text):
    # Test case-sensitive
    result = processor.unique_words(sample_text, case_sensitive=True)
    assert 'Hello' in result
    assert 'hello' not in result
    
    # Test case-insensitive
    result = processor.unique_words(sample_text, case_sensitive=False)
    assert 'hello' in result
    assert len([word for word in result if word.lower() == 'hello']) == 1

if __name__ == '__main__':
    pytest.main([__file__]) 