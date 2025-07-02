.PHONY: help test test-unit test-integration coverage lint format type check install install-dev clean docker-test docker-build venv

VENV = venv
PYTHON = $(VENV)/bin/python3

# Default target
help:
	@echo "Available commands:"
	@echo "  make venv          Create virtual environment"
	@echo "  make install        Install production dependencies"
	@echo "  make install-dev    Install development dependencies"
	@echo "  make test          Run all tests"
	@echo "  make test-unit     Run unit tests only"
	@echo "  make coverage      Run tests with coverage report"
	@echo "  make lint          Run code linting"
	@echo "  make format        Auto-format code with black"
	@echo "  make type          Run type checking with mypy"
	@echo "  make check         Run all checks (lint, type, test)"
	@echo "  make docker-test   Run tests in Docker"
	@echo "  make docker-build  Build Docker image"
	@echo "  make clean         Clean up generated files"

# Create virtual environment
venv:
	python3 -m venv $(VENV)

# Install dependencies
install: $(VENV)/bin/activate
	$(PYTHON) -m pip install -r requirements.txt

install-dev: $(VENV)/bin/activate
	$(PYTHON) -m pip install -r requirements-dev.txt

# Testing commands
test: $(VENV)/bin/activate
	$(PYTHON) -m pytest

test-unit: $(VENV)/bin/activate
	$(PYTHON) -m pytest test/test_math_utils.py -v

test-integration: $(VENV)/bin/activate
	$(PYTHON) -m pytest -m integration

coverage: $(VENV)/bin/activate
	$(PYTHON) -m pytest --cov=mathnotes --cov-report=term-missing --cov-report=html
	@echo "Coverage report generated in htmlcov/index.html"

# Code quality commands
lint: $(VENV)/bin/activate
	$(PYTHON) -m flake8 mathnotes test

format: $(VENV)/bin/activate
	$(PYTHON) -m black mathnotes test

type: $(VENV)/bin/activate
	$(PYTHON) -m mypy mathnotes

# Combined checks
check: lint type test

# Auto-create venv if it doesn't exist
$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements-dev.txt

# Docker commands
docker-test:
	docker-compose run --rm web pytest

docker-build:
	docker-compose build

# Tox commands (if tox is installed)
tox:
	tox

tox-py311:
	tox -e py311

tox-lint:
	tox -e lint

tox-coverage:
	tox -e coverage

# Clean up
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".tox" -exec rm -rf {} +
	find . -type d -name "htmlcov" -exec rm -rf {} +
	find . -type f -name ".coverage" -delete
	find . -type f -name "coverage.xml" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +