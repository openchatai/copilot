# Variables
export TARGET=production
DOCKER_COMPOSE=docker-compose

# Colors
COLOR_RESET=\033[0m
COLOR_BOLD=\033[1m
COLOR_GREEN=\033[32m
COLOR_YELLOW=\033[33m

# Check if Docker is installed
DOCKER_INSTALLED := $(shell command -v docker-compose 2> /dev/null)
LLM_SERVER_ENV_EXISTS := $(shell [ -f llm-server/.env ] && echo "true" || echo "false")

COMMON_SETUP = \
	@echo "$(COLOR_BOLD)=== 🟢 Putting the services down (if already running) ===$(COLOR_RESET)"; \
	$(DOCKER_COMPOSE) down; \
	@echo "$(COLOR_BOLD)=== 🟢 Setting up Docker environment ===$(COLOR_RESET)"; \
	if [ "$(LLM_SERVER_ENV_EXISTS)" = "false" ]; then \
		echo "Copying llm-server/.env.example to llm-server/.env"; \
		cp llm-server/.env.example llm-server/.env; \
	fi; \
	@echo "$(COLOR_BOLD)=== 🟢 Copying .env files ===$(COLOR_RESET)"; \
	cp -n dashboard/.env.example dashboard/.env 2>/dev/null || true;

# Targets
install: 
ifndef DOCKER_INSTALLED
	$(error Docker is not installed. Please visit https://www.docker.com/get-started to download and install Docker.)
endif
	$(COMMON_SETUP)
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up -d #--force-recreate
	@echo "$(COLOR_BOLD)=== 🟢 Waiting for services to start (~30 seconds) ===$(COLOR_RESET)"
	@sleep 30
	@echo "$(COLOR_BOLD)=== 🟢 Running Alembic migrations ===$(COLOR_RESET)"
	$(DOCKER_COMPOSE) exec -T llm-server sh -c "cd models && python setup_alembic.py && alembic upgrade head"
	@echo "$(COLOR_BOLD)=== Installation completed ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== 🔥🔥 You can now access the dashboard at -> http://localhost:8888 ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== Enjoy! ===$(COLOR_RESET)"

install-arm: 
ifndef DOCKER_INSTALLED
	$(error Docker is not installed. Please visit https://www.docker.com/get-started to download and install Docker.)
endif
	$(COMMON_SETUP)
	$(DOCKER_COMPOSE) -f docker-compose.arm.yml up -d --build
	@echo "$(COLOR_BOLD)=== 🟢 Waiting for services to start (~30 seconds) ===$(COLOR_RESET)"
	@sleep 30
	@echo "$(COLOR_BOLD)=== 🟢 Running Alembic migrations ===$(COLOR_RESET)"
	$(DOCKER_COMPOSE) exec -T llm-server sh -c "cd models && python setup_alembic.py && alembic upgrade head"
	@echo "$(COLOR_BOLD)=== Installation completed ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== 🔥🔥 You can now access the dashboard at -> http://localhost:8888 ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== Enjoy! ===$(COLOR_RESET)"

migrate:
	@echo "$(COLOR_BOLD)=== 🟢 Running Alembic migrations ===$(COLOR_RESET)"
	$(DOCKER_COMPOSE) exec llm-server sh -c "cd models && python setup_alembic.py && alembic upgrade head"

down:
	$(DOCKER_COMPOSE) down --remove-orphans

exec-dashboard:
	$(DOCKER_COMPOSE) exec dashboard /bin/sh

exec-llm-server:
	$(DOCKER_COMPOSE) exec llm-server bash

restart:
	$(DOCKER_COMPOSE) restart
	@echo "$(COLOR_BOLD)=== Restart completed ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== 🔥🔥 You can now access the dashboard at -> http://localhost:8888 ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== Enjoy! ===$(COLOR_RESET)"

logs:
	$(DOCKER_COMPOSE) logs -f

# Define the help target
help:
	@echo "$(COLOR_BOLD)Usage: make [target]$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BOLD)Available Targets:$(COLOR_RESET)"
	@echo ""
	@echo "  $(COLOR_GREEN)install$(COLOR_RESET)            - Install and set up the Docker environment"
	@echo "  $(COLOR_GREEN)db-setup$(COLOR_RESET)           - Set up the database (fresh migration with seeding)"
	@echo "  $(COLOR_GREEN)down$(COLOR_RESET)               - Stop and remove all containers"
	@echo "  $(COLOR_GREEN)exec-dashboard$(COLOR_RESET)     - Access the dashboard container's shell"
	@echo "  $(COLOR_GREEN)exec-llm-server$(COLOR_RESET)    - Access the llm-server container's shell"
	@echo "  $(COLOR_GREEN)restart$(COLOR_RESET)            - Restart all containers"
	@echo "  $(COLOR_GREEN)logs$(COLOR_RESET)               - Show container logs"
	@echo "  $(COLOR_GREEN)purge$(COLOR_RESET)              - Full clean un-install (will remove containers, networks, volumes, .env) "
	@echo ""
	@echo "  $(COLOR_YELLOW)help$(COLOR_RESET)              - Display this help message"
	@echo ""

# Add the 'purge' target
purge:
	@echo "$(COLOR_BOLD)=== 🟥 Purging all containers, volumes, and network ===$(COLOR_RESET)"
	$(DOCKER_COMPOSE) down -v --remove-orphans
	rm -f llm-server/.env

.PHONY: install down