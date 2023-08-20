# Variables
APP_NAME = opencopilot-flask-app

# Colors
COLOR_RESET = \033[0m
COLOR_BOLD = \033[1m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m

# Check if Docker is installed
DOCKER_INSTALLED := $(shell command -v docker 2> /dev/null)

# Targets
build:
    ifndef DOCKER_INSTALLED
	    $(error Docker is not installed. Please visit https://www.docker.com/get-started to download and install Docker.)
    endif

	@echo "$(COLOR_BOLD)=== Building Docker image for Flask app ===$(COLOR_RESET)"
	docker build -t $(APP_NAME) .

run:
	@echo "$(COLOR_BOLD)=== Running Flask app container ===$(COLOR_RESET)"
	docker run -d -p 5000:5000 --restart=always $(APP_NAME)

stop:
	@echo "$(COLOR_BOLD)=== Stopping Flask app container ===$(COLOR_RESET)"
	docker stop $$(docker ps -q --filter ancestor=$(APP_NAME)) || true

.PHONY: build run
