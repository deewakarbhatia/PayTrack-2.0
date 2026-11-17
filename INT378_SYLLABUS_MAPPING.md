# PayTrack 2.0 – INT378 Syllabus & Practical Curriculum Mapping

> **Course Code:** INT378  
> **Course Title:** Advancements in Cloud and DevOps  
> **Academic Session:** 2026–27  
> **Department:** School of Computer Science and Engineering  
> **Institution:** Lovely Professional University (LPU), Punjab, India  
> **Document Purpose:** Complete academic audit and mapping of all 6 Units and all 10 Practicals to concrete project implementations in PayTrack 2.0.

---

## 1. Master Syllabus Coverage Matrix (All 6 Units)

```text
+-------------------------------------------------------------------------------------------------------------+
|                                  INT378: ADVANCEMENTS IN CLOUD AND DEVOPS                                   |
+--------+-------------------------------------------------+--------------------------------------------------+
| Unit   | Core Theoretical & Practical Concept            | Concrete PayTrack 2.0 Implementation Component  |
+--------+-------------------------------------------------+--------------------------------------------------+
| Unit 1 | AWS Core Infrastructure, VPC & EC2 Deployment   | Custom VPC, Public/Private Subnets, IGW, EC2     |
| Unit 2 | Cloud Identity, Governance, IAM, MFA & RBAC     | AWS IAM Roles/Policies, JWT App RBAC, Secrets    |
| Unit 3 | Infrastructure as Code (CloudFormation & TF)   | Terraform HCL Modules + AWS CloudFormation YAML  |
| Unit 4 | Containerization, Docker & Docker Hub Registry | Multi-stage ARM64/AMD64 Dockerfile, Compose      |
| Unit 5 | CI/CD Automation, Jenkins & DevSecOps           | Jenkinsfile, GitHub Webhooks, SonarQube, Trivy   |
| Unit 6 | K8s Orchestration, Observability & Serverless  | K8s Manifests, Prometheus, Grafana, Lambda, Cost |
+--------+-------------------------------------------------+--------------------------------------------------+
```

---

## 2. Comprehensive Unit-by-Unit Implementation Breakdown

### Unit 1: Cloud Architecture, Virtualization, Networking & Compute
* **Syllabus Topics:** Cloud computing models (IaaS, PaaS, SaaS), virtualization technologies, AWS Global Infrastructure (Regions, AZs), Amazon Virtual Private Cloud (VPC), Subnets (Public vs Private), Internet Gateways (IGW), Route Tables, Elastic IP (EIP), NAT Gateways, Amazon EC2 instance families, AMI selection, Security Groups, Key Pairs, and EC2 user-data initialization scripts.
* **PayTrack 2.0 Implementation:**
  - **Custom Virtual Private Cloud (VPC):** Defined with CIDR `10.0.0.0/16` across two Availability Zones (`ap-south-1a`, `ap-south-1b`).
  - **Subnet Segmentation:** Two public subnets (`10.0.1.0/24`, `10.0.2.0/24`) housing the ALB and NAT Gateway; two private application subnets (`10.0.10.0/24`, `10.0.11.0/24`) isolating the backend API and container workloads; two private database subnets (`10.0.20.0/24`, `10.0.21.0/24`).
  - **Amazon EC2 Compute:** Ubuntu 22.04 LTS instance provisioned on Free Tier (`t2.micro` / `t3.micro`), configured via automated bash user-data scripts to install Docker, Docker Compose, and Node Exporter.
  - **Stateful Security Groups:** Granular ingress/egress rules separating public web traffic (ports 80/443), backend API access (port 5000), internal database connections (port 27017), and telemetry endpoints (ports 9090, 9100).
  - **File Artifacts:** `infrastructure/terraform/ec2_vpc.tf`, `infrastructure/cloudformation/vpc_ec2_stack.yml`.

---

### Unit 2: Cloud Identity, Governance, Security & Access Management
* **Syllabus Topics:** AWS Identity and Access Management (IAM), IAM Users, Groups, Roles, and Customer Managed Policies; Principle of Least Privilege (PoLP); Multi-Factor Authentication (MFA); Cross-account roles; Role-Based Access Control (RBAC); AWS Secrets Manager and Systems Manager Parameter Store.
* **PayTrack 2.0 Implementation:**
  - **AWS IAM Roles for EC2:** `PayTrack-EC2-AppRole` granting instance profiles scoped permissions exclusively for `s3:PutObject`, `s3:GetObject` on the PayTrack receipt bucket and `secretsmanager:GetSecretValue`. No hardcoded AWS credentials stored on compute nodes.
  - **IAM Multi-Factor Authentication (MFA):** Documented IAM policy enforcing hardware/virtual MFA token authentication prior to initiating critical infrastructure modifications.
  - **Application-Level RBAC:** Cryptographic JWT tokens containing role claims (`ADMIN`, `MANAGER`, `USER`). Middleware (`middleware/auth.js`) intercepting REST routes to enforce permission boundaries.
  - **Secrets Management:** Sensitive environmental variables (Twilio Auth Tokens, MongoDB URI passwords, JWT secret keys) retrieved dynamically from **AWS Secrets Manager** in production, replacing plaintext `.env` configurations.
  - **File Artifacts:** `documentation/security/iam_policies/`, `backend/middleware/auth.js`, `backend/config/secrets.js`.

---

### Unit 3: Infrastructure as Code (IaC) & Automation
* **Syllabus Topics:** Fundamentals of IaC; Declarative vs Imperative provisioning; AWS CloudFormation (Template syntax, Resources, Parameters, Mappings, Outputs, Drift Detection, Stacks); HashiCorp Terraform (Architecture, HCL syntax, Terraform State `terraform.tfstate`, Providers, Resources, Variables, Modules, `terraform init/plan/apply/destroy`).
* **PayTrack 2.0 Implementation:**
  - **Dual IaC Strategy:** Full infrastructure is written in both **HashiCorp Terraform** and **AWS CloudFormation** to compare declarative paradigms and multi-cloud vs cloud-native tools.
  - **Terraform Implementation:** Modularized HCL code with separate files for `variables.tf`, `providers.tf`, `vpc.tf`, `ec2.tf`, `s3.tf`, and `outputs.tf`. Remote state locking pattern documented for S3 and DynamoDB.
  - **AWS CloudFormation Implementation:** Single-file production stack (`vpc_ec2_stack.yml`) deploying VPC, Subnets, Internet Gateway, Security Groups, and EC2 instances with native AWS parameter validations.
  - **File Artifacts:** `infrastructure/terraform/*.tf`, `infrastructure/cloudformation/*.yml`.

---

### Unit 4: Containerization, Docker & Microservices Architecture
* **Syllabus Topics:** Monolith to Microservices transition; Container virtualization vs Hypervisors; Docker Architecture (Docker Daemon, Client, Images, Containers); Dockerfile creation, instructions (`FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`, `EXPOSE`, `ENV`); Multi-stage builds; Container networking; Docker Volumes (Bind mounts vs Named volumes); Docker Compose multi-container orchestration; Docker Hub registry push/pull; Apple Silicon / ARM64 vs AMD64 multi-architecture builds.
* **PayTrack 2.0 Implementation:**
  - **Apple Silicon (M5) Optimization:** Base images selected and tested for `linux/arm64` (`node:20-alpine`, `mongo:7.0`, `prom/prometheus`).
  - **Multi-Stage Dockerfiles:** Backend and Frontend Dockerfiles leverage multi-stage builds. Build dependencies are discarded in the builder stage, resulting in ultra-compact runtime images (< 150MB for Node, < 25MB for React Nginx).
  - **Docker Compose:** Orchestrates 6 connected services (`mongo`, `backend`, `frontend`, `prometheus`, `node-exporter`, `grafana`) on a shared private bridge network (`paytrack-network`) with persistent volumes and health checks.
  - **Docker Hub Registry:** Production images tagged semantically and published to Docker Hub (`docker buildx build --platform linux/amd64,linux/arm64 -t username/paytrack-backend:v1.0.0 --push .`).
  - **File Artifacts:** `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`.

---

### Unit 5: Continuous Integration, Continuous Delivery (CI/CD) & DevSecOps
* **Syllabus Topics:** CI/CD concepts; Jenkins Architecture (Controller/Agent node model); Jenkins Pipelines (Scripted vs Declarative `Jenkinsfile`); SCM integration and GitHub Webhooks; Automated testing; DevSecOps principles; Static Application Security Testing (SAST) with SonarQube; Container image vulnerability scanning with Trivy; Quality Gates; Automated artifacts deployment.
* **PayTrack 2.0 Implementation:**
  - **Declarative Jenkins Pipeline:** Standardized `Jenkinsfile` executing 7 automated stages:
    1. *Checkout:* Git clone triggered automatically by GitHub push webhook.
    2. *Install Dependencies:* Clean install using `npm ci`.
    3. *Unit & Integration Tests:* Jest test runner and Supertest executing API test suites with code coverage reporting.
    4. *SonarQube SAST Analysis:* SonarScanner analyzing code complexity, security vulnerabilities, and enforcing Quality Gate pass status.
    5. *Docker Multi-Arch Build:* Docker Buildx building ARM64/AMD64 images.
    6. *Trivy Security Scan:* Scanning container layers for CVEs; failing the build on unpatched *CRITICAL* vulnerabilities.
    7. *Registry Push & Deploy:* Pushing verified images to Docker Hub and triggering zero-downtime rolling deployment.
  - **File Artifacts:** `jenkins/Jenkinsfile`, `sonar-project.properties`, `backend/tests/`.

---

### Unit 6: Container Orchestration, Cloud Monitoring, Serverless & Cost Management
* **Syllabus Topics:** Kubernetes core architecture (Control plane: API Server, etcd, Scheduler, Controller Manager; Worker nodes: Kubelet, Kube-proxy, Container runtime); Kubernetes objects (Pods, Deployments, Services, ConfigMaps, Secrets, Ingress, Horizontal Pod Autoscaler); Monitoring & Observability with Prometheus and Node Exporter; Grafana dashboard design and alert rules; Serverless architecture with AWS Lambda and Amazon API Gateway; CloudWatch logs and metrics; Cloud Cost Management with AWS Cost Explorer and AWS Budgets.
* **PayTrack 2.0 Implementation:**
  - **Kubernetes Manifests:** Declarative YAML specifications in `infrastructure/kubernetes/` defining:
    - `Deployment`: 3 replicas with rolling update strategy and liveness/readiness probes.
    - `Service`: Exposing backend and frontend via `ClusterIP` and `NodePort`.
    - `ConfigMap` & `Secret`: Injecting non-sensitive environment variables and base64-encoded credentials.
    - `HPA (HorizontalPodAutoscaler)`: Auto-scaling pods based on CPU utilization target (70%).
  - **Observability Stack:**
    - **Prometheus:** Pulls metrics from Node Exporter (port 9100) and PayTrack Express API (port 5000 `/metrics`) every 15s.
    - **Grafana:** Auto-provisioned dashboards visualizing CPU, memory, HTTP request rates, response latency histograms, and alert success counters.
  - **Serverless Integration:**
    - **AWS Lambda & API Gateway:** Node.js 20 serverless webhook function ingesting external payment status updates and notifying users asynchronously via Twilio.
  - **CloudWatch & Cost Governance:**
    - Log groups with 7-day retention.
    - AWS Budgets configured with \$5.00 cost limit and automated SNS notification alerts.
  - **File Artifacts:** `infrastructure/kubernetes/*.yml`, `monitoring/prometheus/prometheus.yml`, `monitoring/grafana/`, `infrastructure/cloudformation/serverless.yml`.

---

## 3. The 10 Practical Experiments – Detailed Verification Guide

| Exp # | Official Practical Title | Lab Objective | PayTrack 2.0 Task & Verification File |
| :---: | :--- | :--- | :--- |
| **P1** | AWS EC2, VPC, Security Groups and Deployment | Provision custom VPC, configure subnets, route tables, launch EC2 instance, configure security groups, and deploy application. | Provision AWS VPC with public/private subnets and deploy PayTrack 2.0 backend on Ubuntu EC2.<br>`infrastructure/terraform/ec2_vpc.tf` |
| **P2** | IAM Users, Roles, Policies, MFA and RBAC | Create IAM users/groups, write least-privilege JSON policies, attach EC2 IAM roles, enforce MFA, and implement app RBAC. | Configure `PayTrack-EC2-AppRole` for S3 access, document MFA policy, and implement JWT-based RBAC.<br>`documentation/security/iam_policies/` |
| **P3** | CloudFormation and Terraform | Write and execute declarative templates to provision AWS networking and compute resources; compare IaC workflows. | Dual infrastructure deployment using AWS CloudFormation YAML and Terraform HCL.<br>`infrastructure/cloudformation/`, `infrastructure/terraform/` |
| **P4** | Docker Image Creation, Containers and Docker Hub | Author multi-stage Dockerfile, build container images, run multi-container applications via Docker Compose, push to Docker Hub. | Author optimized ARM64/AMD64 Dockerfiles for React and Node.js, run full local stack via Docker Compose.<br>`docker-compose.yml`, `backend/Dockerfile` |
| **P5** | Terraform Provisioning of EC2 and S3 | Write modular Terraform scripts to provision an EC2 compute instance and an Amazon S3 bucket with secure access controls. | Terraform scripts provisioning EC2 instance with user-data script and private encrypted S3 bucket for receipts.<br>`infrastructure/terraform/s3_storage.tf` |
| **P6** | Jenkins CI/CD with GitHub Webhooks | Install Jenkins, configure build agents, integrate GitHub Webhook triggers, and construct automated build/test pipeline. | Automated Jenkins declarative pipeline (`Jenkinsfile`) triggered via GitHub Webhook on commit push.<br>`jenkins/Jenkinsfile` |
| **P7** | DevSecOps: Code Analysis, CVE Scanning & Secrets | Integrate SonarQube SAST scanning, Trivy container image vulnerability scanning, and AWS Secrets Manager into CI/CD. | Quality Gate enforcement in Jenkins, Trivy vulnerability scanning, zero hardcoded secrets using Secrets Manager.<br>`jenkins/Jenkinsfile`, `sonar-project.properties` |
| **P8** | Prometheus and Node Exporter Monitoring | Install and configure Prometheus server, deploy Node Exporter to scrape OS/hardware metrics, instrument app endpoints. | Prometheus scraping system metrics from Node Exporter (:9100) and custom API metrics from Express (:5000/metrics).<br>`monitoring/prometheus/prometheus.yml` |
| **P9** | Grafana Dashboards and Visualizations | Connect Grafana to Prometheus data source, design operational dashboards, configure alert rules and metric thresholds. | Auto-provisioned Grafana dashboards displaying live CPU, memory, network, and HTTP API response latency metrics.<br>`monitoring/grafana/provisioning/` |
| **P10**| AWS Lambda, API Gateway, CloudWatch & Budgets | Deploy serverless Lambda function behind API Gateway, monitor execution via CloudWatch, configure AWS Budgets cost alerts. | Serverless payment webhook handler with API Gateway, CloudWatch log retention, and \$5.00 AWS Budget alert.<br>`infrastructure/cloudformation/serverless.yml` |
