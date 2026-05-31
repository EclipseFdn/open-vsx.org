# Open VSX Architecture Documentation

**Purpose**: This document provides a comprehensive overview of the open-vsx.org system architecture, technical stack, deployment strategy, and development workflows for new team members.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Directory Structure & Components](#directory-structure--components)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Deployment Strategy](#deployment-strategy)
6. [Development Workflow](#development-workflow)
7. [Observability Stack](#observability-stack)
8. [Security & Scanning](#security--scanning)

---

## Project Overview

### What is Open VSX?

**Open VSX** (open-vsx.org) is a public, open-source marketplace for VS Code extensions. It serves as an alternative to the Microsoft Visual Studio Code Marketplace, enabling extension developers to publish, manage, and distribute their extensions to users worldwide.

- **Public Instance**: open-vsx.org is the community-hosted instance of Eclipse Open VSX
- **Upstream Project**: Core functionality maintained in [eclipse/openvsx](https://github.com/eclipse/openvsx)
- **This Repository**: Contains customizations, configurations, and infrastructure specific to open-vsx.org
- **License**: Eclipse Public License v2.0 (EPL-2.0)
- **Hosting**: Deployed on OpenShift Kubernetes clusters (OKD)

### Key Features

- **Extension Publishing**: Publishers can upload and manage VS Code extensions
- **Search & Discovery**: Users can search and discover extensions with full-text search powered by Elasticsearch
- **Rating & Reviews**: Community-driven ratings and reviews for extensions
- **Rate Limiting**: Protects API from abuse using Bucket4j and Redis
- **Security Scanning**: Multiple layers of malware detection (ClamAV, YARA rules)
- **Availability Monitoring**: Continuous monitoring with uptime tracking
- **Analytics**: Track usage, downloads, and publishing trends

---

## Technical Stack

### Backend Services

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Application Server** | Spring Boot (Java) | Core REST API, web application logic |
| **Web Framework** | Spring Web MVC | HTTP request handling |
| **Database** | PostgreSQL | Primary data store for extensions, users, namespaces |
| **Search Engine** | Elasticsearch | Full-text search, faceted search for extensions |
| **Cache** | Redis Cluster | Session storage, rate limiting buckets, caching |
| **Task Scheduling** | JobRunr | Background jobs (email, migrations, cleanup) |
| **Authentication** | OAuth2 (Eclipse) | Eclipse Foundation identity |
| **API Documentation** | OpenAPI/Swagger | Auto-generated API documentation |

### Frontend Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18+ | UI component library |
| **Build Tool** | Webpack 5 | Bundling and module resolution |
| **Language** | TypeScript | Type-safe JavaScript |
| **Component Library** | Material-UI (MUI) | Pre-built UI components |
| **Routing** | React Router v5+ | Client-side routing |
| **Package Manager** | Yarn 4.9.1 | Dependency management |
| **Compilation** | TypeScript Compiler | TSX → JavaScript |
| **Dev Server** | Express.js | Development server with mock service |

### Infrastructure & Deployment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container Runtime** | CRI-O | Application containerization |
| **Orchestration** | OpenShift/Kubernetes | Container orchestration and deployment |
| **Helm** | Kubernetes package manager | Templating and deployment automation |
| **CI/CD** | Jenkins | Build, test, and deployment automation |
| **Container Registry** | GitHub Container Registry (ghcr.io) | Publish and store Docker images |

### Observability & Monitoring

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Metrics** | Prometheus | Metrics collection from Spring Boot actuator |
| **Log Aggregation** | Grafana Agent (Alloy) | Log shipping and metric forwarding |
| **Dashboards** | Grafana | Visualization of metrics and logs |
| **Tracing** | OpenTelemetry | Distributed tracing (1% sampling) |
| **Uptime Monitoring** | Better Stack | External availability monitoring |
| **Alerting** | Grafana Cloud | Alert management and notifications |

### Security & Scanning

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Malware Scanner** | ClamAV REST | Virus and malware detection |
| **YARA Scanner** | YARA REST | Malware pattern matching and detection |
| **Secret Detection** | Gitleaks Integration | Detects exposed credentials and secrets |
| **Rate Limiting** | Bucket4j | API rate limiting with Redis backend |
| **DDoS Protection** | WAF (via Infrastructure) | Network-level protection |

---

## Directory Structure & Components

### Root Level Files

```
Dockerfile              # Multi-stage Docker build (builder + runtime)
Jenkinsfile            # CI/CD pipeline configuration (Jenkins DSL)
LICENSE                # Eclipse Public License v2.0
README.md              # Project readme with setup instructions
SECURITY.md            # Security vulnerability reporting policy
sonar-project.properties # SonarQube configuration for code quality
```

#### Example: Dockerfile
The Dockerfile uses a **multi-stage build** pattern:

# Builder stage compiles frontend
**Stage 1 - Builder**: 
- Installs Node.js and Yarn
- Compiles TypeScript website code
- Builds production-ready bundles using Webpack

# Runtime stage inherits from OpenVSX server
**Stage 2 - Runtime**:
- Inherits from Eclipse OpenVSX server image
- Copies compiled static files (HTML, JS, CSS)
- Copies configuration files (application.yml, logback-spring.xml)
- Copies email templates

---

### `/configuration` - Application Configuration

Contains configuration files for the Spring Boot application.

**Files**:
- **application.yml** - Main Spring Boot configuration file
- **logback-spring.xml** - Logging configuration

---

### `/website` - Frontend Application

The frontend React application that users interact with at open-vsx.org.

**Structure**:
```
website/
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── webpack.config.js        # Production Webpack config
├── src/                     # TypeScript source files
│   ├── main.tsx            # Main React app entry point
│   ├── page-settings.tsx   # Theme and page customization
│   ├── about.tsx           # About page
│   ├── adopters.tsx        # Adopters list page
│   ├── members.tsx         # Team members page
│   ├── document.tsx        # Document rendering
│   └── components/         # Reusable React components
│       ├── adopters-list.tsx
│       └── members-list.tsx
├── dev/                     # Development setup
│   ├── main-dev.tsx        # Development app entry with mocks
│   ├── mock-service.ts     # Mock API service for testing
│   ├── webpack.config.js   # Development Webpack config
│   └── server/
│       └── index.js        # Express dev server
└── static/                  # Built assets (generated)
    └── index.html          # Base HTML file
```

**Development Workflow Example**:
```bash
cd website
yarn install                    # Install dependencies
yarn compile                    # Compile TypeScript
yarn watch:tsc &               # Watch TS changes in background
yarn watch:dev &               # Watch webpack changes
yarn start:dev                 # Start Express dev server
# Open http://localhost:3000 - uses mock-service.ts for API calls
```

---

### `/charts/openvsx` - Helm Deployment Chart

Kubernetes Helm chart for deploying the application.

**Files**:
- **Chart.yaml** - Helm metadata
- **values.yaml** - Production configuration
- **values-staging.yaml** - Staging environment (lower resources)
- **values-test.yaml** - Testing environment (minimal resources)

**Templates**:
- **deployment.yaml** - Main application deployment
- **service.yaml** - Kubernetes Service (load balancer)
- **route.yaml** - OpenShift Route (ingress)
- **elasticsearch.yaml** - Elasticsearch cluster definition
- **redis-cluster.yaml** - Redis cluster deployment
- **grafana-alloy.yaml** - Observability sidecar
- **clamav-rest/**, **yara-rest/** - Scanning services

---

### `/kubernetes` - Deployment Scripts

**Files**:
- **helm-deploy.sh** - Main deployment automation script
  ```bash
  ./kubernetes/helm-deploy.sh test "image-tag"          # Deploy to test env
  ./kubernetes/helm-deploy.sh staging "image-tag"       # Deploy to staging
  ./kubernetes/helm-deploy.sh production "image-tag"    # Deploy to production
  ```
  
  **What it does**:
  1. Validates environment and image tag parameters
  2. Selects appropriate values file (values-test.yaml, values-staging.yaml, values.yaml)
  3. Adds Grafana Helm repository
  4. Builds Helm chart dependencies
  5. Runs `helm upgrade --install` to deploy/update

- **clusterroles.yaml** - Kubernetes RBAC configuration
- **README.md** - Deployment documentation

---

### `/configuration`, `/dashboards`, `/reports`

- **logback-spring.xml** - Spring Boot logging configuration
- **Grafana Agent Overview-*.json** - Pre-built Grafana dashboard
- **Tracing-*.json** - Distributed tracing dashboard
- **Spring Boot Statistics-*.json** - Application statistics
- **Reports** (Python scripts & Jupyter notebooks)
  - `get_all_extensions.py` - Scrape all published extensions metadata
  - `graph_trends.ipynb` - Jupyter notebook visualizing publishing trends
  - `graph_most_active.ipynb` - Top publishers and extensions analysis
  - `get_open_vsx_data.py` - Collect activity metrics

---

### `/mail-templates`

Contains HTML email templates:
- **revoked-access-tokens.html** - Notification when user's API tokens are revoked

---

### `/docs`

Documentation directory

---

## CI/CD Pipeline

### Jenkins Pipeline Overview

The **Jenkinsfile** defines an automated build and deployment pipeline triggered on Git events.

### Pipeline Stages

#### Stage 1: Build Docker Image
- **Agent**: docker-build node
- **Action**: Runs `docker build --pull -t ghcr.io/eclipsefdn/openvsx-website:${IMAGE_TAG} .`
- **Purpose**: Creates container image with compiled website and Spring Boot application
- **Image Tag Format**: `<git-commit>-<build-number>` or `<tag-name>-<build-number>`

#### Stage 2: Push Docker Image
- **Agent**: docker-build node
- **Action**: Authenticates with GitHub Container Registry and pushes image
- **Credentials**: Jenkins secret `a56a2346-7fc5-4f91-a624-073197e5f5c8`
- **Registry**: `https://ghcr.io/eclipseFdn/openvsx-website`

#### Stage 3: Deploy to target Environment
- **Trigger**: When branch name is "test"
- **Agent**: Kubernetes agent with kubectl and kubeconfig
- **Action**: 
  ```bash
  ./kubernetes/helm-deploy.sh test "${IMAGE_TAG}"
  ```
- **Target**: `open-vsx-org-test` namespace

- **Trigger**: When branch name is "main"
- **Agent**: Kubernetes agent with kubectl
- **Action**: 
  ```bash
  ./kubernetes/helm-deploy.sh staging "${IMAGE_TAG}"
  ```
- **Target**: `open-vsx-org-staging` namespace

- **Trigger**: When branch name is "production"
- **Agent**: Kubernetes agent with kubectl
- **Action**: 
  ```bash
  ./kubernetes/helm-deploy.sh production "${IMAGE_TAG}"
  ```
- **Target**: `open-vsx-org` namespace (production cluster)

### Post-Build Actions

- **Failure**: Sends email to `ci-admin@eclipse.org` with build details
- **Fixed**: Sends success notification after recovery
- **Cleanup**: Deletes Jenkins workspace after completion

---

## Deployment Strategy

### Multi-Environment Deployment

Open VSX uses a **three-tier deployment strategy** with separate Kubernetes namespaces and cluster resources:

1. Test Environment
2. Staging Environment
3. Production Environment

### Deployment Mechanism: Helm

**Helm** is Kubernetes package manager providing:
- **Templating**: Dynamic YAML generation from values files
- **Version Control**: Track deployment versions and history
- **Rollback**: Easy rollback to previous versions
- **Dependency Management**: Grafana Alloy and other charts as dependencies

**Example Helm Upgrade**:
```bash
helm upgrade --install production ./charts/openvsx \
  -f values.yaml \
  --set image.tag="abc1234-99" \
  --namespace open-vsx-org


### Rolling Update Strategy

- **Strategy**: RollingUpdate (default)
- **Max Surge**: 1 additional pod
- **Max Unavailable**: 0 pods (zero-downtime)
- **Health Checks**:
  - **Liveness Probe**: Restart unhealthy pods
  - **Readiness Probe**: Remove from load balancing if unhealthy
  - **Startup Probe**: Grace period before readiness checks

---

## Development Workflow

### Setting Up Local Development

#### Prerequisites
- Node.js 20.x
- Yarn 4.9.1
- Java 17+ (optional, for backend changes)
- Docker (optional, for containerized testing)

#### Frontend Development

```bash
# Clone and navigate
git clone https://github.com/EclipseFdn/open-vsx.org.git
cd open-vsx.org

# Setup and install dependencies
cd website
corepack enable
corepack prepare yarn@4.9.1 --activate
yarn install

# Compile TypeScript
yarn compile

# Development mode with watchers
yarn watch:tsc &                    # Terminal 1: Watch TS compilation
yarn watch:dev &                    # Terminal 2: Watch Webpack bundling
yarn start:dev                      # Terminal 3: Start dev server

# Open http://localhost:3000 in browser
# Mock API service (mock-service.ts) returns dummy data
```

**Key Development Features**:
- **Hot Reload**: Changes to TSX automatically recompile
- **Source Maps**: Debug TypeScript directly in browser DevTools
- **Mock Service**: Simulates API responses (no backend required)
- **Redux DevTools**: Time-travel debugging available
- **HMR** (Hot Module Replacement): Webpack dev server updates without page refresh

---

## Observability Stack

### Metrics Collection

**Prometheus** scrapes metrics from multiple sources:

1. **Spring Boot Actuator** 
2. **Redis Exporter**
3. **Elasticsearch Metrics**
4. **Grafana Alloy**

### Dashboards

Pre-built Grafana dashboards included:

1. **Grafana Agent Overview**
2. **Spring Boot Statistics**
3. **Tracing Dashboard**
4. **Logs Dashboard**


### Uptime Monitoring

**Better Stack** (external monitoring service):
- Pings open-vsx.org endpoint every 5 minutes
- Tracks availability percentage (target: 99.9%)
- Alerts on outages
- Historical data for SLA reporting

---

## Security & Scanning

### Extension Scanning Pipeline

When a user publishes an extension, the system runs multiple security checks:

1. ClamAV REST (Antivirus)
2. YARA REST (Pattern Matching)
3. Secret Detection (Gitleaks)
4. Similarity Check
5. Rate Limiting
