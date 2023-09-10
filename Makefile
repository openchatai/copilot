# Variables
DOCKER_COMPOSE = docker-compose

# Colors
COLOR_RESET = \033[0m
COLOR_BOLD = \033[1m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m

# Check if Docker is installed
DOCKER_INSTALLED := $(shell command -v docker-compose 2> /dev/null)
LLM_SERVER_ENV_EXISTS := $(shell [ -f llm-server/.env ] && echo "true" || echo "false")


# Targets
install:
    ifndef DOCKER_INSTALLED
	    $(error Docker is not installed. Please visit https://www.docker.com/get-started to download and install Docker.)
    endif

	@echo "$(COLOR_BOLD)=== Putting the services down (if already running) ===$(COLOR_RESET)"
	$(DOCKER_COMPOSE) down #--remove-orphans

	@echo "$(COLOR_BOLD)=== Setting up Docker environment ===$(COLOR_RESET)"

    # Check if llm-server/.env exists
    ifeq ($(LLM_SERVER_ENV_EXISTS),false)
	    $(error Please make sure to copy llm-server/.env.example to .env and fill it with the needed keys.)
    endif

    # Copy .env.example to .env for dashboard
    # Show warning before continue, and wait for 10 seconds
	@echo "$(COLOR_BOLD)=== This will overwrite your .env files, you still have some time to abort ===$(COLOR_RESET)"
	@sleep 5
	@echo "$(COLOR_BOLD)=== Copying .env files ===$(COLOR_RESET)"
	cp -n dashboard/.env.example dashboard/.env 2>/dev/null || true
	$(DOCKER_COMPOSE) build #--no-cache
	$(DOCKER_COMPOSE) up -d #--force-recreate
	@echo "$(COLOR_BOLD)=== Waiting for services to start (~20 seconds) ===$(COLOR_RESET)"
	@sleep 20

	@echo "$(COLOR_BOLD)=== Clearing backend server config cache ===$(COLOR_RESET)"
	$(DOCKER_COMPOSE) exec backend php artisan cache:clear
	$(DOCKER_COMPOSE) exec backend php artisan config:cache
	$(DOCKER_COMPOSE) exec backend php artisan migrate
	$(DOCKER_COMPOSE) exec backend php artisan key:generate

	@echo "$(COLOR_BOLD)=== Run backend server migrations ===$(COLOR_RESET)"
	$(DOCKER_COMPOSE) exec backend php artisan storage:link

	@echo "$(COLOR_BOLD)=== Installation completed ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== 🔥🔥 You can now access the dashboard at -> http://localhost:8888 ===$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)=== Enjoy! ===$(COLOR_RESET)"

db-setup:
	$(DOCKER_COMPOSE) exec backend php artisan migrate:fresh --seed

down:
	$(DOCKER_COMPOSE) down --remove-orphans

exec-backend:
	$(DOCKER_COMPOSE) exec backend bash

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
	@echo "  $(COLOR_GREEN)exec-backend$(COLOR_RESET)      - Access the backend container's shell"
	@echo "  $(COLOR_GREEN)exec-dashboard$(COLOR_RESET)    - Access the dashboard container's shell"
	@echo "  $(COLOR_GREEN)exec-llm-server$(COLOR_RESET)   - Access the llm-server container's shell"
	@echo "  $(COLOR_GREEN)restart$(COLOR_RESET)            - Restart all containers"
	@echo "  $(COLOR_GREEN)logs$(COLOR_RESET)               - Show container logs"
	@echo ""
	@echo "  $(COLOR_YELLOW)help$(COLOR_RESET)               - Display this help message"
	@echo ""


.PHONY: install down
