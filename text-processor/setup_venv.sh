#!/bin/bash
python3 -m venv venv
source venv/bin/activate
pip install pytest
echo "Virtual environment set up and pytest installed. Run 'python3 test_process.py' to test."


