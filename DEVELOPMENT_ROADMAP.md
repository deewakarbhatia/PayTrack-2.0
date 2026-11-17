# PayTrack 2.0 – Phased Development Roadmap

> **Course:** INT378 – Advancements in Cloud and DevOps (2026–27)  
> **Institution:** Lovely Professional University (LPU)  
> **Development Environment:** macOS Apple Silicon (M5 / ARM64) -> AWS Cloud  
> **Execution Strategy:** Incremental, Test-Driven, Milestone-Gated  

---

## 1. Master Milestone Timeline & Progress Tracker

```text
[ Milestone 1 ]  Architecture, Requirements & Syllabus Mapping       <-- COMPLETED (CURRENT)
      │
[ Milestone 2 ]  Backend Core REST API & MongoDB Persistence          <-- NEXT UP
      │
[ Milestone 3 ]  Twilio Smart Notification Engine & Cron Scheduler   
      │
[ Milestone 4 ]  React.js Frontend Dashboard & User Interface        
      │
[ Milestone 5 ]  Automated Testing (Jest/Supertest) & DevSecOps Tools
      │
[ Milestone 6 ]  Docker Containerization & Multi-Container Compose    
      │
[ Milestone 7 ]  Infrastructure as Code (Terraform & CloudFormation) 
      │
[ Milestone 8 ]  Jenkins CI/CD Automation Pipeline & GitHub Webhooks 
      │
[ Milestone 9 ]  Kubernetes (K8s) Cluster Orchestration & HPA        
      │
[ Milestone 10]  Monitoring (Prometheus/Grafana) & Serverless Lambda  
      │
[ Milestone 11]  Final Verification, Academic Report & Viva Voce Prep
```

---

## 2. Detailed Milestone Specifications

---

### Milestone 1: Requirements Analysis, Architecture & Project Skeleton (CURRENT)
- **Status:** **COMPLETED & AWAITING USER APPROVAL**
- **Objectives:**
  1. Complete system requirements analysis and Twelve-Factor application modeling.
  2. Design end-to-end cloud-native microservices architecture with Mermaid diagrams.
  3. Establish clean directory layout with `.gitignore` and `docker-compose.yml`.
  4. Author foundational documentation: `README.md`, `PROJECT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `INT378_SYLLABUS_MAPPING.md`, `DEVELOPMENT_ROADMAP.md`, and `PRACTICAL_CHECKLIST.md`.
  5. Map all 6 Units and 10 Practicals to explicit code artifacts and verification tasks.
- **Deliverables:** Master architectural blueprints, syllabus mapping matrix, and container skeleton.

---

### Milestone 2: Backend Core REST API & MongoDB Persistence
- **Estimated Scope:** 3–4 Days
- **Objectives:**
  1. Initialize Node.js 20 LTS project with Express.js framework.
  2. Establish connection to MongoDB 7.0 using Mongoose ODM with automated retry logic.
  3. Implement Mongoose Schemas:
     - `User`: Full name, email (unique), password (hashed), phone number, role (`ADMIN`, `MANAGER`, `USER`), alert preferences.
     - `Payment`: Title, category, amount, currency, due date, status (`PENDING`, `PAID`, `OVERDUE`), recurring frequency, receipt URL, user reference.
     - `NotificationLog`: Channel (SMS/WhatsApp), recipient, timestamp, status, provider SID.
  4. Build Authentication & RBAC subsystem:
     - Password hashing using `bcrypt` (salt rounds: 10).
     - JWT token generation and verification middleware (`middleware/auth.js`).
     - Role authorization guardrails (`middleware/authorize.js`).
  5. Implement REST API controllers:
     - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
     - `POST /api/payments`, `GET /api/payments`, `GET /api/payments/:id`, `PUT /api/payments/:id`, `DELETE /api/payments/:id`.
     - `GET /health` (unauthenticated health check).
     - `GET /metrics` (`prom-client` metrics endpoint).
- **Syllabus / Practical Link:** Unit 2 (RBAC), Unit 6 (Prometheus Metrics), 12-Factor (Backing Services, Config).
- **Definition of Done:** All REST endpoints respond cleanly, passwords are cryptographically hashed, JWT tokens enforce role restrictions, and health/metrics endpoints return valid payloads.

---

### Milestone 3: Twilio Smart Notification Engine & Cron Scheduler
- **Estimated Scope:** 2–3 Days
- **Objectives:**
  1. Integrate official Twilio Node.js SDK (`twilio`).
  2. Create modular `notificationService.js` supporting both SMS and WhatsApp dispatch.
  3. Implement automated background scheduler via `node-cron`:
     - Evaluates pending payments daily at 09:00 AM.
     - Dispatches T-3 day reminders, due-day urgent alerts, and overdue follow-up notifications.
  4. Log all alert transactions into MongoDB `NotificationLog` collection for auditing.
  5. Expose manual trigger endpoint (`POST /api/notifications/test-alert`) for testing.
- **Syllabus / Practical Link:** Unit 6 (Event-driven processes, Background workers).
- **Definition of Done:** Automated scheduler executes without memory leaks; test alert successfully delivers SMS/WhatsApp to verified phone numbers.

---

### Milestone 4: React.js Frontend Dashboard & User Interface
- **Estimated Scope:** 3–4 Days
- **Objectives:**
  1. Initialize React 18 SPA with Tailwind CSS for modern responsive styling.
  2. Implement React Router v6 with protected route authentication wrappers.
  3. Build UI views and components:
     - **Login / Register Page:** Form validation and JWT storage in local storage.
     - **Main Dashboard:** KPI summary cards (Total Spent, Due This Week, Overdue Penalties).
     - **Payment Management:** Interactive table with category badges, status indicators, and modal dialogs for Create/Edit/Delete.
     - **Analytics View:** Monthly expenditure bar charts and category breakdown pie charts.
     - **Notification Settings:** User toggles for SMS vs WhatsApp channels.
  4. Integrate Axios with HTTP request interceptors attaching `Authorization: Bearer <token>`.
- **Syllabus / Practical Link:** Cloud-Native UI, 12-Factor (Separation of concerns).
- **Definition of Done:** Clean, modern UI rendered seamlessly in web browser, communicating with the backend API on `http://localhost:5000/api`.

---

### Milestone 5: Automated Testing (Jest/Supertest) & DevSecOps Hardening
- **Estimated Scope:** 2 Days
- **Objectives:**
  1. Author unit tests for authentication logic and payment validation using **Jest**.
  2. Author integration tests for API endpoints using **Supertest** against an in-memory/test MongoDB instance.
  3. Configure code coverage reporting (`npm test -- --coverage`).
  4. Set up **SonarQube** configuration (`sonar-project.properties`) and define Quality Gates (zero blocker/critical bugs, code coverage > 75%).
  5. Install and configure **Trivy** to scan dependencies and local files for vulnerabilities.
- **Syllabus / Practical Link:** Unit 5 & Practical 7 (DevSecOps, Static Code Analysis, Vulnerability Scanning).
- **Definition of Done:** All unit and integration tests pass ($100\%$ pass rate); SonarQube quality gate passes; Trivy vulnerability report generated.

---

### Milestone 6: Docker Containerization & Multi-Container Compose
- **Estimated Scope:** 2 Days
- **Objectives:**
  1. Author production-grade multi-stage `backend/Dockerfile` targeting Node 20 Alpine.
  2. Author production-grade multi-stage `frontend/Dockerfile` utilizing Nginx Alpine to serve compiled React bundles.
  3. Ensure seamless multi-architecture builds (`linux/arm64` for Apple Silicon M5 and `linux/amd64` for cloud deployment) via `docker buildx`.
  4. Wire up all 6 services in `docker-compose.yml` (`mongo`, `backend`, `frontend`, `prometheus`, `node-exporter`, `grafana`).
  5. Document Docker Hub push workflow with semantic tags.
- **Syllabus / Practical Link:** Unit 4 & Practical 4 (Docker images, Multi-container apps, Docker Hub).
- **Definition of Done:** Single command `docker compose up --build -d` boots entire operational platform on macOS M5 without platform emulation errors.

---

### Milestone 7: Infrastructure as Code (Terraform & AWS CloudFormation)
- **Estimated Scope:** 3 Days
- **Objectives:**
  1. Author modular Terraform HCL scripts in `infrastructure/terraform/`:
     - `vpc.tf`: Custom VPC, subnets across 2 AZs, IGW, NAT Gateway, Route Tables.
     - `security_groups.tf`: Ingress/egress rules for HTTP, HTTPS, Node.js API, MongoDB.
     - `ec2.tf`: Ubuntu 22.04 LTS instance with automated user-data provisioning script.
     - `s3.tf`: Encrypted receipt storage bucket with public access block.
     - `iam.tf`: Instance profile role with least-privilege policies.
  2. Author AWS CloudFormation template in `infrastructure/cloudformation/vpc_ec2_stack.yml`.
  3. Validate templates via `terraform validate`, `terraform plan`, and `aws cloudformation validate-template`.
- **Syllabus / Practical Link:** Unit 1, Unit 3 & Practicals 1, 3, 5 (IaC, CloudFormation, Terraform, VPC, EC2, S3).
- **Definition of Done:** Terraform and CloudFormation scripts pass syntax validation and dry-run execution plans with zero errors.

---

### Milestone 8: Jenkins CI/CD Automation Pipeline & GitHub Webhooks
- **Estimated Scope:** 3 Days
- **Objectives:**
  1. Configure Jenkins controller with Node.js, Docker, SonarQube Scanner, and Trivy plugins.
  2. Create declarative `Jenkinsfile` orchestrating the 7 pipeline stages.
  3. Configure GitHub Webhook trigger on push events (`http://<jenkins-url>:8080/github-webhook/`).
  4. Implement automated Docker image build, Trivy scan, and Docker Hub push.
  5. Implement automated staging deployment trigger.
- **Syllabus / Practical Link:** Unit 5 & Practical 6, 7 (Jenkins CI/CD, GitHub Webhooks, DevSecOps).
- **Definition of Done:** Code push to GitHub automatically triggers Jenkins pipeline; pipeline executes tests, security scans, builds multi-arch image, and reports green status.

---

### Milestone 9: Kubernetes (K8s) Cluster Orchestration
- **Estimated Scope:** 2–3 Days
- **Objectives:**
  1. Create Kubernetes declarative YAML manifests in `infrastructure/kubernetes/`:
     - `backend-deployment.yml`: Pod spec, container ports, environment from ConfigMap/Secret, liveness (`/health`) and readiness probes.
     - `backend-service.yml`: `ClusterIP` exposing API internally.
     - `frontend-deployment.yml` & `frontend-service.yml`: Nginx frontend served via `NodePort` / `LoadBalancer`.
     - `mongo-statefulset.yml`: StatefulSet with PersistentVolumeClaim (PVC).
     - `hpa.yml`: HorizontalPodAutoscaler targeting 70% CPU threshold.
  2. Deploy and verify on local Minikube / K3s cluster.
- **Syllabus / Practical Link:** Unit 6 (Kubernetes Architecture, Pods, Deployments, Services, HPA).
- **Definition of Done:** All pods in `Running` state; rolling update deployment succeeds; HPA scales pod replicas under simulated load.

---

### Milestone 10: Production Observability, Serverless & Cost Governance
- **Estimated Scope:** 2–3 Days
- **Objectives:**
  1. Finalize Prometheus metrics scraping for Node Exporter and Express backend.
  2. Build and export Grafana dashboard JSON displaying:
     - Real-time CPU, RAM, Network I/O.
     - API request rate, $P_{95}$ latency, 4xx/5xx error rates.
     - Twilio alert dispatch counter.
  3. Deploy AWS Lambda function with AWS API Gateway for payment webhook callbacks.
  4. Configure AWS CloudWatch log group with 7-day retention.
  5. Configure AWS Budgets with \$5.00 limit and SNS email alert.
- **Syllabus / Practical Link:** Unit 6 & Practicals 8, 9, 10 (Prometheus, Grafana, Lambda, API Gateway, CloudWatch, Budgets).
- **Definition of Done:** Live Grafana dashboard visualizes real-time metrics; Lambda function processes sample webhook; AWS Budget alert triggers on threshold.

---

### Milestone 11: Final Project Verification, Academic Report & Viva Voce Preparation
- **Estimated Scope:** 2 Days
- **Objectives:**
  1. Perform complete end-to-end dry run across all 10 practical experiments.
  2. Assemble comprehensive academic lab documentation with terminal logs and screenshots.
  3. Compile Viva Voce Q&A handbook covering all INT378 concepts.
  4. Deliver final presentation walkthrough.
- **Definition of Done:** Project is 100% complete, fully documented, and ready for maximum marks in LPU's INT378 evaluation.
