#!/bin/bash
python3 -m venv venv
. venv/bin/activate
pip install --upgrade -r requirements.in
pip freeze > requirements.txt

pip install --upgrade -r requirements-dev.in
pip freeze > requirements-dev.txt
