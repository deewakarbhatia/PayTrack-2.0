# PayTrack 2.0 – Smart Payment Alert and Record Management System

> **B.Tech Capstone Project**  
> **Course:** INT378 – Advancements in Cloud and DevOps (2026–27)  
> **Institution:** Lovely Professional University (LPU), Punjab, India  
> **Author:** Final Year B.Tech Computer Science and Engineering  
> **Architecture Target:** Cloud-Native, 12-Factor Compliant, Apple Silicon (ARM64) & AWS Multi-Arch  

---

## 1. Project Overview & Problem Statement

Modern individuals and small-to-medium enterprises (SMEs) struggle with fragmented financial records across bank portals, billing apps, and utility accounts. Unnoticed billing cycles often trigger punitive late fees, disrupted services, and damaged credit scores. Existing record-keeping applications suffer from:
1. **Disconnected Notification Channels:** Relying exclusively on passive email notifications that get buried in spam.
2. **Monolithic & Non-Scalable Architectures:** Incapable of dynamically scaling during month-end payment reconciliation peaks.
3. **Inadequate Security & Governance:** Storing credentials insecurely in plaintext and lacking automated vulnerability scanning.
4. **Poor Operational Visibility:** Zero observability into system health, database latency, and notification delivery failures.

**PayTrack 2.0** is an enterprise-grade, cloud-native **Smart Payment Alert and Record Management System**. It provides centralized payment tracking, invoice attachment management, role-based financial record access, and an automated event-driven notification engine powered by **Twilio (SMS & WhatsApp)**.

Engineered from the ground up to demonstrate mastery of **INT378 (Advancements in Cloud and DevOps)**, PayTrack 2.0 implements modern cloud engineering, dual Infrastructure-as-Code (Terraform & AWS CloudFormation), containerization, Kubernetes orchestration, end-to-end DevSecOps CI/CD, and full-stack observability.

---

## 2. Key Capabilities & Architectural Highlights

- **Multi-Channel Alert Dispatcher:** Automated scheduled alerts via Twilio API delivering SMS and WhatsApp notifications before due dates, on due dates, and for overdue follow-ups.
- **Enterprise Role-Based Access Control (RBAC):** Granular permissions separating `Admin`, `Auditor/Finance Manager`, and `Standard User` using cryptographically signed JSON Web Tokens (JWT) and BCrypt hashing.
- **12-Factor Cloud-Native Methodology:** Explicit dependency declaration, strict separation of config from code via environment variables, stateless API processes, backing services treated as attached resources, and fast startup/graceful shutdown.
- **Dual Infrastructure as Code (IaC):** Production-ready provisioning using both **HashiCorp Terraform** (modular HCL for AWS VPC, Subnets, EC2, S3, and Security Groups) and **AWS CloudFormation** (declarative YAML stacks for AWS resources).
- **Apple Silicon Native Containerization:** Multi-architecture Docker images (`linux/arm64` for macOS M5 local development and `linux/amd64` for AWS EC2/EKS cloud deployment) with multi-stage builds minimizing image attack surface.
- **Zero-Trust DevSecOps Pipeline:** Automated Jenkins CI/CD pipeline triggered via GitHub Webhooks, enforcing strict quality gates via **SonarQube** (static application security testing - SAST) and **Trivy** (container image vulnerability scanning).
- **Production Observability Stack:** Real-time metrics scraping using **Prometheus**, host-level resource telemetry via **Node Exporter**, and visualization dashboards built on **Grafana**.
- **Serverless Burst Architecture:** Event-driven **AWS Lambda** microservice integrated with **AWS API Gateway** to ingest third-party payment webhooks and trigger asynchronous alerts.
- **Cloud Governance & Cost Optimization:** Strict IAM least-privilege policies, AWS Secrets Manager credential rotation, CloudWatch log retention policies, and AWS Budgets alerting.

---

## 3. Technology Stack & Academic Syllabus Alignment

| Layer / Domain | Technology | Version / Specification | Academic Relevance (INT378) |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React.js | React 18+ (Hooks, Context, Axios, Tailwind CSS) | Cloud-Native Single Page Application |
| **Backend REST API** | Node.js & Express.js | Node 20 LTS, Express 4.x | RESTful API, Prometheus client metrics |
| **Database** | MongoDB with Mongoose | MongoDB 7.0 (Mongoose ODM) | Persistent Document Store, Indexed Collections |
| **Notifications** | Twilio SDK | REST API (SMS & WhatsApp Sandbox/Live) | External Third-Party Integration |
| **Cloud Provider** | Amazon Web Services (AWS) | VPC, EC2, S3, IAM, CloudWatch, Lambda, API Gateway | Unit 1, Unit 2, Unit 6 |
| **IaC (Declarative)** | AWS CloudFormation | AWS CFN YAML Stacks | Unit 3 & Practical 3 |
| **IaC (Multi-Cloud)** | Terraform | HashiCorp Terraform >= 1.7 (HCL) | Unit 3 & Practical 3, 5 |
| **Containers** | Docker & Docker Compose | Docker Engine 25+, Compose v2, ARM64/AMD64 | Unit 4 & Practical 4 |
| **Container Registry**| Docker Hub | Automated tagging (`vX.Y.Z`, `latest`) | Unit 4 & Practical 4 |
| **Orchestration** | Kubernetes | Minikube (Local) & AWS EKS (Cloud) | Unit 6 |
| **Continuous Integration** | Jenkins | Jenkins LTS (Pipeline-as-Code via Jenkinsfile) | Unit 5 & Practical 6 |
| **SCM Triggers** | GitHub Webhooks | Push/PR Webhooks with HMAC Verification | Unit 5 & Practical 6 |
| **Code Quality & SAST**| SonarQube & SonarScanner | Static Code Analysis, Coverage & Quality Gates | Unit 5 & Practical 7 |
| **Vulnerability Scanner**| Trivy | Aqua Security Trivy (CVE & Misconfiguration scan) | Unit 5 & Practical 7 |
| **Secrets Management**| AWS Secrets Manager | Cloud Key-Vault & Local `.env` encryption | Unit 2 & Practical 7 |
| **Metric Telemetry** | Prometheus & Node Exporter| Time-series DB (Port 9090) & Host Agent (Port 9100) | Unit 6 & Practical 8 |
| **Dashboarding** | Grafana | Grafana OSS (Port 3001), Custom JSON Dashboards | Unit 6 & Practical 9 |
| **Serverless & Cost** | AWS Lambda, API Gateway | Node.js 20 Lambda, AWS Budgets, Cost Explorer | Unit 6 & Practical 10 |
| **Automated Testing** | Jest & Supertest | Unit & Integration Test Suites | Unit 5 Test Automation |

---

## 4. Directory Structure

```text
PayTrack-2.0/
├── .gitignore                          # Production-grade git exclusion rules
├── docker-compose.yml                  # Local development multi-container orchestration
├── README.md                           # Master project documentation & overview
├── PROJECT_REQUIREMENTS.md             # Functional and Non-Functional Requirements
├── ARCHITECTURE.md                     # Deep architectural diagrams & data flow models
├── INT378_SYLLABUS_MAPPING.md          # Comprehensive mapping across all 6 Units
├── DEVELOPMENT_ROADMAP.md              # Milestone-based phased execution plan
├── PRACTICAL_CHECKLIST.md              # 10-Practical lab verification & viva guide
├── frontend/                           # React.js SPA (UI components, pages, context)
├── backend/                            # Node.js/Express REST API (controllers, models, routes)
├── infrastructure/
│   ├── terraform/                      # Terraform HCL modules (VPC, EC2, S3, IAM)
│   ├── cloudformation/                 # AWS CloudFormation YAML infrastructure templates
│   └── kubernetes/                     # K8s YAML manifests (deployments, services, configs)
├── monitoring/
│   ├── prometheus/                     # Prometheus scraping configuration (prometheus.yml)
│   └── grafana/                        # Auto-provisioned datasources and dashboards
├── jenkins/                            # Declarative Jenkinsfile pipeline & runner scripts
└── documentation/
    ├── architecture/                   # High-res diagrams and design rationale
    ├── practicals/                     # Practical 1-10 execution reports and terminal outputs
    ├── security/                       # RBAC policies, IAM policies, and scan reports
    └── testing/                        # Test plans, Jest/Supertest coverage reports
```

---

## 5. Local Quickstart (MacBook Air M5 Apple Silicon)

### Prerequisites
- macOS 15+ (Apple Silicon M5 / ARM64)
- Docker Desktop for Mac with VirtioFS and Rosetta 2 enabled (for multi-arch compatibility)
- Node.js LTS (v20+) & npm
- Terraform CLI (v1.7+)
- AWS CLI v2 configured with IAM admin credentials (`aws configure`)

### Running Local Development Stack
```bash
# Clone the project and navigate into the root directory
cd PayTrack-2.0

# Verify Docker engine is running on Apple Silicon
docker info | grep -E "Architecture|Operating System"

# Launch all backing services (MongoDB, Prometheus, Node Exporter, Grafana)
docker compose up -d mongo prometheus node-exporter grafana

# Check running container health
docker compose ps
```

### Accessing Local Services
- **React Frontend:** `http://localhost:3000`
- **Node.js REST API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/health`
- **Prometheus Metrics:** `http://localhost:5000/metrics`
- **Prometheus UI:** `http://localhost:9090`
- **Node Exporter Telemetry:** `http://localhost:9100/metrics`
- **Grafana Dashboards:** `http://localhost:3001` (Credentials: `admin` / `admin`)

---

## 6. INT378 Practical Verification Matrix

| Exp # | Practical Title | Key Technology Used | Verification File Location |
| :---: | :--- | :--- | :--- |
| **1** | AWS EC2, VPC, Security Groups & Deployment | AWS CLI, VPC, EC2, Ubuntu 22.04 | `infrastructure/terraform/ec2_vpc.tf` |
| **2** | IAM Users, Roles, Policies, MFA & RBAC | AWS IAM, JSON Policies, JWT RBAC | `documentation/security/iam_policies/` |
| **3** | CloudFormation & Terraform Provisioning | CloudFormation YAML, Terraform HCL | `infrastructure/cloudformation/` |
| **4** | Docker Images, Containers & Docker Hub | Dockerfile, Compose, Docker Hub | `docker-compose.yml`, `backend/Dockerfile` |
| **5** | Terraform Provisioning of EC2 and S3 | Terraform AWS Provider, S3 Bucket | `infrastructure/terraform/s3_storage.tf` |
| **6** | Jenkins CI/CD with GitHub Webhooks | Jenkinsfile, Webhook, SCM triggers | `jenkins/Jenkinsfile` |
| **7** | DevSecOps, Code Analysis, CVE Scanning | SonarQube, Trivy, Secrets Manager | `jenkins/Jenkinsfile`, `documentation/security/` |
| **8** | Prometheus & Node Exporter Monitoring | Prometheus TSDB, Node Exporter agent | `monitoring/prometheus/prometheus.yml` |
| **9** | Grafana Dashboards & Visualizations | Grafana OSS, Metric Dashboards | `monitoring/grafana/` |
| **10**| Serverless Lambda, API Gateway & Budgets | AWS Lambda, API Gateway, Budgets | `infrastructure/cloudformation/serverless.yml` |

---

## 7. Academic Integrity & Declaration
This project is developed as an individual original work for the academic course **INT378 (Advancements in Cloud and DevOps)** at **Lovely Professional University (LPU)**. All infrastructure scripts, application code, container definitions, and CI/CD pipelines are designed to follow industry standards while adhering to LPU's evaluation rubric.
