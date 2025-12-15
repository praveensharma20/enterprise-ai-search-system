PY?=python3
VENV=.venv

.PHONY: help venv install run-backend run-frontend docker-up

help:
	@echo "Available targets: venv, install, run-backend, run-frontend, docker-up"

venv:
	$(PY) -m venv $(VENV)
	@echo "Created virtualenv at $(VENV)"

install: venv
	. $(VENV)/bin/activate && pip install -r backend/requirements.txt

run-backend:
	. $(VENV)/bin/activate && uvicorn backend.app.main:app --reload --port 8000

run-frontend:
	python3 -m http.server 8080 --directory frontend

docker-up:
	docker-compose up --build
