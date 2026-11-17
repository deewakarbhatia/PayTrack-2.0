# PayTrack 2.0 – Project Requirements Specification

> **Course:** INT378 – Advancements in Cloud and DevOps  
> **Academic Session:** 2026–27  
> **Institution:** Lovely Professional University (LPU)  
> **Document Status:** Approved Baseline (Milestone 1)  

---

## 1. Executive Summary & Scope

**PayTrack 2.0** is an enterprise-grade cloud-native Smart Payment Alert and Record Management System. The platform solves the ubiquitous problem of forgotten financial obligations, late penalties, and disorganized payment receipts across utility bills, academic fees, corporate invoices, and subscription plans.

The primary engineering objective of this project is to serve as a comprehensive, end-to-end demonstration of the **INT378** curriculum: bridging application software engineering (React.js, Node.js, MongoDB) with advanced cloud infrastructure, container orchestration, automated DevSecOps pipelines, serverless computing, and real-time observability.

---

## 2. User Personas & Actors

| Persona | Role Code | Description & Responsibilities |
| :--- | :--- | :--- |
| **Individual User / Student** | `ROLE_USER` | Manages personal bills, tuition fees, subscriptions; receives timely SMS/WhatsApp alerts; uploads receipts. |
| **Finance Manager / Auditor** | `ROLE_MANAGER` | Oversees departmental budgets, reviews payment proofs, generates fiscal expenditure reports, reconciles accounts. |
| **System Administrator / DevOps** | `ROLE_ADMIN` | Configures system parameters, manages IAM access, monitors Prometheus/Grafana telemetry, inspects CI/CD builds. |

---

## 3. Functional Requirements (FR)

### FR-1: User Registration, Authentication & Identity
- **FR-1.1:** The system shall allow users to register with name, email, phone number (with country code), password, and notification preferences.
- **FR-1.2:** Passwords must be hashed using `bcrypt` with a minimum salt work factor of 10 prior to persistence in MongoDB.
- **FR-1.3:** The authentication subsystem must issue cryptographically signed JSON Web Tokens (JWT) containing user ID, role, and expiration (e.g., 24 hours).
- **FR-1.4:** Protected REST endpoints must validate the JWT token header (`Authorization: Bearer <token>`) via dedicated authentication middleware.

### FR-2: Role-Based Access Control (RBAC)
- **FR-2.1:** The system shall enforce role authorization middleware (`authorize(['ADMIN', 'MANAGER'])`) on sensitive administrative endpoints.
- **FR-2.2:** Regular users may only view, edit, or delete their own payment records.
- **FR-2.3:** Finance Managers may view all tenant records and mark invoices as verified/reconciled.
- **FR-2.4:** Admins retain full CRUD privileges across all user records, system logs, and metric aggregations.

### FR-3: Payment Record Lifecycle Management
- **FR-3.1:** Users shall be able to create new payment obligations with the following schema:
  - Title, Description, and Category (e.g., *Tuition, Utility, Rent, Subscription, Insurance, EMI*).
  - Amount and Currency (default: INR / USD).
  - Due Date and Time.
  - Recurring Frequency (*None, Weekly, Monthly, Quarterly, Annually*).
  - Payment Status (*Pending, Paid, Overdue*).
  - Payment Method (*UPI, Credit Card, Net Banking, Cash*).
- **FR-3.2:** The system shall support full CRUD operations: Create, Read (with pagination, filtering by category and date), Update, and Delete.
- **FR-3.3:** When marked as *Paid*, the record must capture the paid timestamp, reference transaction ID, and optional receipt URL.

### FR-4: Smart Notification & Alert Engine (Twilio Integration)
- **FR-4.1:** The notification engine must integrate with **Twilio REST APIs** for both **SMS** and **WhatsApp** messaging.
- **FR-4.2:** Automated cron scheduler (e.g., Node-Cron) shall run periodically to evaluate pending obligations:
  - **T-3 Days Alert:** Send reminder 72 hours before due date.
  - **Due Day Alert:** Send high-priority alert on the morning of the due date.
  - **Overdue Alert:** Send alert every 48 hours for overdue payments until cleared.
- **FR-4.3:** Notification logs must be recorded in MongoDB with timestamp, channel (SMS/WhatsApp), recipient number, delivery status, and Twilio message SID.
- **FR-4.4:** Users must be able to toggle preferred notification channels (SMS, WhatsApp, or Both) in their profile.

### FR-5: Invoice & Receipt Attachment Storage (AWS S3)
- **FR-5.1:** Users may upload payment receipt images or PDF files (max size: 5MB).
- **FR-5.2:** Uploaded assets must be stored in an **AWS S3 Bucket** provisioned via Terraform, with metadata references saved in MongoDB.
- **FR-5.3:** Direct public access to S3 must be blocked; receipts shall be accessed via secure pre-signed URLs with a 15-minute validity window.

### FR-6: Analytics & Financial Reporting
- **FR-6.1:** The dashboard must display total monthly expenditure, upcoming liabilities due within 7 days, and overdue penalty exposure.
- **FR-6.2:** The UI shall provide interactive expense breakdown charts categorized by billing type.
- **FR-6.3:** Users and managers must be able to export payment history records into structured CSV and JSON formats.

### FR-7: Cloud & Observability Telemetry Endpoints
- **FR-7.1:** The backend must expose an unauthenticated health check endpoint at `GET /health` returning service status, uptime, and database connection state.
- **FR-7.2:** The backend must expose a Prometheus-formatted metric scrape endpoint at `GET /metrics` using `prom-client` exposing:
  - HTTP request counters by route and status code (`http_requests_total`).
  - Request duration histograms (`http_request_duration_seconds`).
  - Total registered users and active payment counters.

### FR-8: Serverless Payment Callback Handler (AWS Lambda & API Gateway)
- **FR-8.1:** An event-driven AWS Lambda function shall be deployed behind AWS API Gateway to ingest external payment webhook callbacks.
- **FR-8.2:** The Lambda function shall parse the transaction payload, validate the digital signature, update the record in MongoDB, and trigger an instant confirmation alert via Twilio.

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- Standard REST API responses must complete with a $95^{\text{th}}$ percentile latency ($P_{95}$) under $200\text{ ms}$ under normal load.
- Background alert dispatching must execute asynchronously to avoid blocking user-facing API threads.

### NFR-2: High Availability & Fault Tolerance
- In cloud deployment, the application must run across at least two Availability Zones (AZs) in AWS with an Application Load Balancer (ALB).
- Containerized pods in Kubernetes must include liveness and readiness probes with automatic restart policies.

### NFR-3: DevSecOps & Software Security
- **Static Application Security Testing (SAST):** SonarQube code scanning integrated into Jenkins must enforce zero *Blocker* or *Critical* bugs/vulnerabilities before any build is eligible for deployment.
- **Container Vulnerability Scanning:** All Docker images must be scanned by **Trivy** in the CI pipeline; images containing unpatched *CRITICAL* CVEs must fail the build.
- **Secrets Governance:** No API keys, database passwords, or JWT secrets may be hardcoded or checked into source control. In AWS, credentials must be dynamically fetched from **AWS Secrets Manager**.
- **Transport Security:** All HTTP traffic must be encrypted via TLS 1.3 in production.

### NFR-4: Scalability & Kubernetes Orchestration
- Backend microservices must scale horizontally via Kubernetes Horizontal Pod Autoscaler (HPA) based on CPU and memory thresholds (target: 70% CPU utilization).
- Database layer must support connection pooling via Mongoose with configurable pool sizes.

### NFR-5: Multi-Architecture Portability (Apple Silicon M5 & Cloud)
- Local development is targeted on macOS Apple Silicon (ARM64). All Docker images must support `linux/arm64` natively.
- CI/CD pipeline must use Docker Buildx to generate multi-architecture manifests (`linux/arm64` and `linux/amd64`) ensuring binary compatibility on AWS EC2 x86_64 or Graviton instances.

### NFR-6: Observability & Monitoring
- System metrics must be collected every 15 seconds by **Prometheus** via **Node Exporter** (OS/host metrics) and Express `/metrics`.
- Visualized operational dashboards in **Grafana** must provide single-pane-of-glass visibility into CPU, memory, disk I/O, network traffic, HTTP error rates (4xx/5xx), and alert success rates.

### NFR-7: Cloud Cost Optimization & Financial Governance
- All cloud infrastructure must remain strictly within the **AWS Free Tier** limits during academic evaluation.
- AWS Budgets must be configured via CloudFormation/Terraform to trigger email alerts at \$5.00 and \$10.00 thresholds.
- AWS Cost Explorer tags (`Project: PayTrack2.0`, `Environment: Development`, `Owner: Student`) must be enforced across all provisioned resources.

---

## 5. Twelve-Factor App Compliance Matrix

| Factor | Principle | PayTrack 2.0 Implementation |
| :---: | :--- | :--- |
| **I. Codebase** | One codebase tracked in revision control, many deploys | Single unified Git repository tracked across Local, Staging, and AWS Production environments. |
| **II. Dependencies** | Explicitly declare and isolate dependencies | `package.json` with locked versions; isolated inside container boundaries with no host dependencies. |
| **III. Config** | Store configuration in the environment | Strict use of `.env` files locally and AWS Secrets Manager / Parameter Store in the cloud; zero hardcoded secrets. |
| **IV. Backing services** | Treat backing services as attached resources | MongoDB, Twilio, AWS S3, and Prometheus are accessed via uniform connection URLs and decoupled interfaces. |
| **V. Build, release, run** | Strictly separate build and run stages | Jenkins CI automates `Build` (npm install/compile), `Release` (Docker image tagging in Docker Hub), and `Run` (K8s pod execution). |
| **VI. Processes** | Execute app as one or more stateless processes | REST API is completely stateless; session state is stored inside signed JWTs; data persisted in MongoDB. |
| **VII. Port binding** | Export services via port binding | Node.js Express binds to port `5000`; React binds to `3000`; Prometheus binds to `9090`; Grafana to `3001`. |
| **VIII. Concurrency** | Scale out via the process model | Horizontal scaling achieved through Kubernetes Deployments (`replicas: 3`) and Node.js clustering/worker processes. |
| **IX. Disposability** | Fast startup and graceful shutdown | SIGTERM and SIGINT handlers close MongoDB connections cleanly and flush pending Twilio jobs. |
| **X. Dev/prod parity** | Keep development, staging, and production as similar as possible | Docker and Docker Compose mirror cloud container runtime locally on Apple Silicon. |
| **XI. Logs** | Treat logs as event streams | Winston/Morgan streams JSON-formatted logs to `stdout`/`stderr`, ingested by AWS CloudWatch and Docker logging drivers. |
| **XII. Admin processes** | Run admin/management tasks as one-off processes | Database migration, seed scripts, and indexing jobs run as isolated Docker/K8s batch jobs. |

---

## 6. Constraints & Limitations

1. **Academic Sandbox Environment:** AWS resource provisioning must adhere strictly to LPU learner lab constraints and free-tier quotas (e.g., `t2.micro` or `t3.micro` EC2 instances, single-region deployment in `us-east-1` or `ap-south-1`).
2. **Twilio Sandbox Mode:** In development and academic demonstration, Twilio WhatsApp utilizes the Twilio Sandbox for WhatsApp; SMS utilizes verified test phone numbers.
3. **Local Hardware Constraints:** MacBook Air M5 Apple Silicon with unified memory requires optimized lightweight container footprints (Alpine/Debian-slim base images).
