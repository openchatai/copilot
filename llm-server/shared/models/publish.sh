#!/bin/bash

# Step 0:
rm -rf build dist opencopilot_db.egg-info
# Step 1: Build the source distribution and wheel
python setup.py sdist bdist_wheel

# Step 2: Upload the distributions using twine
twine upload dist/*

# Step 3: Remove build and distribution directories
rm -rf build dist opencopilot_db.egg-info
