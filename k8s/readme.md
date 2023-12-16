## set OPENAI_API_KEY in configmap.yaml

## Deploying Opencopilot to Kubernetes

---

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Building and Pushing Docker Images](#building-and-pushing-docker-images)
- [Deploying the App in Kubernetes](#deploying-the-app-in-kubernetes)
- [CI/CD Pipelines](#cicd-pipelines)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Provide a brief overview of your project, its purpose, and the technologies used.

## Prerequisites



### Docker Login

```bash
docker login -u codebanesr
# Enter the API token when prompted for the password
```

### Building and Pushing Docker Images

```bash
docker-compose build
docker-compose push
```

Currently pushing with tag `arm`, this will be changed to `latest` when we set up our CI/CD pipelines.

## Deploying the App in Kubernetes

To deploy the app in Kubernetes, use the following command:

```bash
kubectl apply -f k8s
```

## CI/CD Pipelines

Explain the setup and configuration of CI/CD pipelines for your project. Include details about the tools and processes involved in the continuous integration and deployment of your application.


## Guide on how to enable monitoring can be found here
https://linkerd.io/2.14/getting-started/