# PayTrack 2.0 – INT378 Practical Examination Checklist & Viva Guide

> **Course:** INT378 – Advancements in Cloud and DevOps  
> **Academic Session:** 2026–27  
> **Institution:** Lovely Professional University (LPU), Punjab, India  
> **Target Audience:** Internal & External Practical Examiners  
> **Purpose:** Comprehensive execution manual, terminal command reference, and Viva Voce defense handbook for all 10 syllabus practicals demonstrated inside PayTrack 2.0.

---

## Quick Reference: 10 Practicals Summary

| Exp | Title | Core Tool / Command | Verification Location | Viva Key Concept |
| :---: | :--- | :--- | :--- | :--- |
| **P1** | AWS EC2, VPC, SG & Deployment | `aws ec2 create-vpc`, `ssh -i key.pem` | `infrastructure/terraform/ec2_vpc.tf` | CIDR, Subnets, Statefulness of SG |
| **P2** | IAM, Roles, Policies, MFA & RBAC | `aws iam create-role`, `jwt.verify()` | `documentation/security/iam_policies/` | PoLP, Policy Evaluation, RBAC |
| **P3** | CloudFormation vs Terraform | `aws cloudformation deploy`, `terraform apply` | `infrastructure/cloudformation/`, `terraform/` | Declarative vs State-Driven IaC |
| **P4** | Docker Images & Docker Hub | `docker buildx`, `docker compose up` | `backend/Dockerfile`, `docker-compose.yml` | Multi-stage builds, ARM64 vs AMD64 |
| **P5** | Terraform EC2 & S3 Provisioning | `terraform init`, `terraform plan` | `infrastructure/terraform/s3_storage.tf` | Providers, State Locking, HCL syntax |
| **P6** | Jenkins CI/CD & GitHub Webhooks | `Jenkinsfile`, Webhook Payload | `jenkins/Jenkinsfile` | Declarative Pipelines, Webhook HMAC |
| **P7** | DevSecOps (SonarQube, Trivy, Secrets) | `sonar-scanner`, `trivy image` | `sonar-project.properties`, `jenkins/` | SAST Quality Gates, CVE Severity |
| **P8** | Prometheus & Node Exporter Monitoring | `curl localhost:9090/targets` | `monitoring/prometheus/prometheus.yml` | Pull vs Push, Time-Series TSDB |
| **P9** | Grafana Dashboards & Visualizations | `http://localhost:3001` | `monitoring/grafana/provisioning/` | Datasource auto-wiring, PromQL |
| **P10**| AWS Lambda, API Gateway & Budgets | `aws lambda create-function`, AWS Budgets | `infrastructure/cloudformation/serverless.yml`| Serverless execution, CloudWatch alarms |

---

## Detailed Practical Execution & Viva Breakdown

---

### Practical 1: AWS EC2, VPC, Security Groups and Deployment
* **Syllabus Unit:** Unit 1 (Cloud Infrastructure & Networking)
* **Objective:** Design a custom VPC, configure public/private subnets across two AZs, configure an Internet Gateway, route tables, establish stateful Security Groups, launch an Ubuntu 22.04 EC2 instance, and deploy PayTrack 2.0.
* **Component Location:** `infrastructure/terraform/ec2_vpc.tf` & `infrastructure/cloudformation/vpc_ec2_stack.yml`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Verify AWS CLI configuration and region
  aws configure list

  # Step 2: Navigate to Terraform directory and initialize AWS provider
  cd infrastructure/terraform
  terraform init

  # Step 3: Inspect the execution plan for VPC and EC2 resources
  terraform plan -target=module.vpc -target=aws_instance.paytrack_server

  # Step 4: Apply infrastructure provisioning
  terraform apply -auto-approve

  # Step 5: SSH into the provisioned EC2 instance using your private key
  ssh -i ~/.ssh/paytrack-key.pem ubuntu@<EC2_PUBLIC_IP>

  # Step 6: Verify deployed services on EC2
  sudo systemctl status docker
  docker ps
  ```
* **Command Explanation for Viva:**
  - `terraform init`: Downloads required provider plugins (AWS provider) into `.terraform/` and sets up backend state.
  - `terraform plan`: Reads local configuration files and current state, producing a speculative execution plan showing exact resources to create (`+`), modify (`~`), or destroy (`-`).
  - `ssh -i`: The `-i` flag specifies the identity file (PEM key pair) containing the private key for asymmetric RSA/Ed25519 authentication.
* **What to Show the Examiner:**
  1. AWS Management Console displaying custom VPC (`10.0.0.0/16`) with attached Internet Gateway.
  2. Security Group inbound rules allowing port 80 (HTTP), 443 (HTTPS), 22 (SSH), and 5000 (API).
  3. Terminal output showing successful SSH connection and running PayTrack backend container.
* **Key Viva Voce Q&A:**
  - **Q1: What is the difference between a Security Group and a Network ACL (NACL)?**  
    *Answer:* A Security Group operates at the **instance/ENI level**, is **stateful** (return traffic is automatically allowed regardless of inbound rules), and only supports `ALLOW` rules. A NACL operates at the **subnet level**, is **stateless** (both inbound and outbound traffic must be explicitly permitted), and supports numbered `ALLOW` and `DENY` rules evaluated in numerical order.
  - **Q2: Why do we place our database in a private subnet?**  
    *Answer:* To enforce defense-in-depth and prevent direct exposure to the public internet. Private subnets do not have a direct route to an Internet Gateway (`0.0.0.0/0 -> igw-xxx`). Only services inside the VPC (like our backend API) can connect on port 27017.

---

### Practical 2: IAM Users, Roles, Policies, MFA and RBAC
* **Syllabus Unit:** Unit 2 (Cloud Identity, Governance & Access Management)
* **Objective:** Implement the Principle of Least Privilege (PoLP) using AWS IAM Users, Groups, Roles, and Customer Managed JSON Policies; enforce Multi-Factor Authentication (MFA); implement role-based access control (RBAC) in the application layer.
* **Component Location:** `documentation/security/iam_policies/` and `backend/middleware/auth.js`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Create IAM EC2 Role for PayTrack App
  aws iam create-role \
    --role-name PayTrack-EC2-AppRole \
    --assume-role-policy-document file://documentation/security/iam_policies/ec2-trust-policy.json

  # Step 2: Attach customer managed policy for S3 receipt access
  aws iam put-role-policy \
    --role-name PayTrack-EC2-AppRole \
    --policy-name PayTrack-S3-ReceiptPolicy \
    --policy-document file://documentation/security/iam_policies/s3-least-privilege-policy.json

  # Step 3: Test Application RBAC locally via curl
  # Attempt to access admin metrics without token (Expected: 401 Unauthorized)
  curl -i http://localhost:5000/api/admin/metrics

  # Attempt with standard user token on admin route (Expected: 403 Forbidden)
  curl -i -H "Authorization: Bearer <USER_JWT_TOKEN>" http://localhost:5000/api/admin/metrics

  # Access with Admin token (Expected: 200 OK)
  curl -i -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" http://localhost:5000/api/admin/metrics
  ```
* **What to Show the Examiner:**
  1. IAM Policy JSON demonstrating explicit `Action: ["s3:PutObject", "s3:GetObject"]` restricted strictly to `Resource: "arn:aws:s3:::paytrack-receipts/*"`.
  2. Terminal responses demonstrating HTTP `401 Unauthorized` (missing token), HTTP `403 Forbidden` (insufficient role privilege), and HTTP `200 OK` (authorized role).
* **Key Viva Voce Q&A:**
  - **Q1: Why should an EC2 instance use an IAM Role instead of storing IAM User access keys?**  
    *Answer:* Storing static AWS Access Keys (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) on an EC2 instance creates a severe security risk if the instance is compromised. IAM Roles use the **AWS Instance Metadata Service (IMDSv2)** to generate short-lived, automatically rotated temporary security credentials via AWS STS.
  - **Q2: What is the evaluation logic of an IAM policy?**  
    *Answer:* AWS IAM evaluates requests using an **explicit deny wins** model: Default is `Deny`. If an explicit `Deny` exists anywhere, the request is denied. If an explicit `Allow` exists and no explicit `Deny` exists, the request is permitted. Otherwise, it remains denied.

---

### Practical 3: CloudFormation and Terraform for Resource Provisioning
* **Syllabus Unit:** Unit 3 (Infrastructure as Code)
* **Objective:** Author and validate infrastructure declarations using both AWS CloudFormation (YAML) and HashiCorp Terraform (HCL); compare state management, drift detection, and modularity.
* **Component Location:** `infrastructure/cloudformation/vpc_ec2_stack.yml` and `infrastructure/terraform/`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Validate CloudFormation template syntax
  aws cloudformation validate-template \
    --template-body file://infrastructure/cloudformation/vpc_ec2_stack.yml

  # Step 2: Deploy CloudFormation stack
  aws cloudformation create-stack \
    --stack-name PayTrack-CFN-Stack \
    --template-body file://infrastructure/cloudformation/vpc_ec2_stack.yml \
    --parameters ParameterKey=EnvironmentName,ParameterValue=Dev

  # Step 3: Check CloudFormation stack status
  aws cloudformation describe-stacks --stack-name PayTrack-CFN-Stack --query "Stacks[0].StackStatus"

  # Step 4: Validate Terraform configuration
  cd infrastructure/terraform
  terraform validate
  terraform fmt -check
  ```
* **Command Explanation for Viva:**
  - `aws cloudformation validate-template`: Parses the YAML/JSON template to verify JSON/YAML syntax and AWS resource schema compliance without creating resources.
  - `terraform validate`: Verifies whether the Terraform configuration is syntactically valid and internally consistent (checking attribute names, types, and resource cross-references).
* **Key Viva Voce Q&A:**
  - **Q1: How does Terraform manage state compared to AWS CloudFormation?**  
    *Answer:* CloudFormation maintains state automatically inside the AWS managed service backend associated with the stack. Terraform stores state in a `terraform.tfstate` file (either locally or in a remote backend like S3 with DynamoDB state locking). Terraform supports multi-cloud providers, whereas CloudFormation is primarily AWS-native.
  - **Q2: What is configuration drift and how is it detected?**  
    *Answer:* Configuration drift occurs when cloud resources are modified out-of-band (e.g., manually in the AWS Console) causing divergence from the IaC template. In CloudFormation, it is detected via **Drift Detection**. In Terraform, `terraform plan` queries the live cloud API and compares actual state against the `.tfstate` file.

---

### Practical 4: Docker Image Creation, Containers and Docker Hub
* **Syllabus Unit:** Unit 4 (Containerization & Microservices)
* **Objective:** Author multi-stage Dockerfiles optimized for Apple Silicon (ARM64) and cloud deployment (AMD64); orchestrate multi-container systems using Docker Compose; publish versioned images to Docker Hub.
* **Component Location:** `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Build multi-architecture image using Docker Buildx on macOS M5
  docker buildx create --use --name paytrack-builder
  docker buildx build \
    --platform linux/arm64,linux/amd64 \
    -t <YOUR_DOCKERHUB_USERNAME>/paytrack-backend:v1.0.0 \
    -f backend/Dockerfile \
    ./backend --load

  # Step 2: Launch full multi-container stack via Docker Compose
  docker compose up -d

  # Step 3: Verify running containers, ports, and health status
  docker compose ps

  # Step 4: Inspect container resource utilization
  docker stats --no-stream

  # Step 5: Push image to Docker Hub
  docker login
  docker push <YOUR_DOCKERHUB_USERNAME>/paytrack-backend:v1.0.0
  ```
* **What to Show the Examiner:**
  1. `backend/Dockerfile` highlighting the `FROM node:20-alpine AS builder` and `FROM node:20-alpine AS runner` multi-stage structure.
  2. `docker compose ps` showing `paytrack-mongo`, `paytrack-backend`, `paytrack-frontend`, `paytrack-prometheus`, `paytrack-node-exporter`, and `paytrack-grafana` running healthy.
  3. Docker Hub web interface showing the published repository with `v1.0.0` tag.
* **Key Viva Voce Q&A:**
  - **Q1: What are the benefits of a multi-stage Docker build?**  
    *Answer:* Multi-stage builds separate the build environment (compilers, build tools, devDependencies) from the lean runtime environment. This significantly reduces the final container image size (e.g., from 900MB down to < 150MB), accelerates deployment speed, and eliminates unnecessary tools to drastically shrink the attack surface.
  - **Q2: Why do you specify `--platform linux/arm64,linux/amd64`?**  
    *Answer:* The development machine runs on Apple Silicon (M5 - ARM64 architecture), while typical AWS EC2 instances run on x86_64 (AMD64) or Graviton (ARM64). Using Docker Buildx generates a multi-architecture manifest list so the container runs natively on both local ARM64 hardware and cloud x86 servers without Rosetta translation overhead.

---

### Practical 5: Terraform Provisioning of EC2 and S3
* **Syllabus Unit:** Unit 3 & Unit 1 (IaC Compute & Storage)
* **Objective:** Write modular Terraform code to provision an AWS EC2 instance (with user-data automation) and an Amazon S3 storage bucket with server-side encryption and public access blocks.
* **Component Location:** `infrastructure/terraform/s3_storage.tf` and `ec2.tf`.
* **Step-by-Step Terminal Commands:**
  ```bash
  cd infrastructure/terraform

  # Step 1: Format Terraform code according to canonical style
  terraform fmt

  # Step 2: Generate execution graph of resources
  terraform graph | dot -Tpng > terraform_graph.png

  # Step 3: Apply S3 and EC2 provisioning
  terraform apply -target=aws_s3_bucket.receipt_bucket -target=aws_instance.paytrack_server -auto-approve

  # Step 4: Verify S3 bucket encryption via AWS CLI
  aws s3api get-bucket-encryption --bucket paytrack-receipts-2026

  # Step 5: Test receipt file upload to S3
  aws s3 cp sample_receipt.png s3://paytrack-receipts-2026/receipts/test.png
  ```
* **What to Show the Examiner:**
  1. Terraform output showing `aws_s3_bucket`, `aws_s3_bucket_server_side_encryption_configuration`, and `aws_s3_bucket_public_access_block` created.
  2. AWS S3 Console showing the bucket with "Bucket and objects not public" and AES-256 encryption enabled.
* **Key Viva Voce Q&A:**
  - **Q1: What is the purpose of `terraform.tfstate` and why should it never be committed to Git?**  
    *Answer:* `terraform.tfstate` records the mapping between your configuration files and the real-world resources created in the cloud. It must never be committed to Git because it contains sensitive unencrypted data (passwords, private keys, resource ARNs) and concurrent commits lead to state corruption. It should be stored in a remote backend like AWS S3 with state locking via DynamoDB.
  - **Q2: How does Terraform enforce S3 bucket security?**  
    *Answer:* By configuring `aws_s3_bucket_public_access_block` to set `block_public_acls = true`, `block_public_policy = true`, `ignore_public_acls = true`, and `restrict_public_buckets = true`, ensuring zero unintentional public exposure.

---

### Practical 6: Jenkins CI/CD Automation Pipeline with GitHub Webhooks
* **Syllabus Unit:** Unit 5 (Continuous Integration & Delivery)
* **Objective:** Configure a Jenkins Controller, integrate GitHub Webhooks for automated push triggers, author a declarative `Jenkinsfile`, and automate building, testing, scanning, and staging deployment.
* **Component Location:** `jenkins/Jenkinsfile`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Check Jenkins service status on the CI server
  sudo systemctl status jenkins

  # Step 2: Test Jenkins pipeline execution locally using Jenkins CLI or simulated runner
  # Trigger build via webhook simulation
  curl -X POST http://localhost:8080/github-webhook/ \
    -H "X-GitHub-Event: push" \
    -H "Content-Type: application/json" \
    --data '{"ref":"refs/heads/main"}'

  # Step 3: View build pipeline console logs
  # (Can be viewed in Jenkins GUI at http://localhost:8080/job/PayTrack-Pipeline)
  ```
* **Jenkins Pipeline Stages Demonstrated:**
  1. `Stage 1: Checkout SCM` – Clones repository using Git credentials.
  2. `Stage 2: Dependency Cache & Install` – Executes `npm ci` for deterministic installs.
  3. `Stage 3: Unit & Integration Test` – Runs `npm test` (Jest & Supertest).
  4. `Stage 4: SonarQube SAST Analysis` – Runs `sonar-scanner` and checks Quality Gate.
  5. `Stage 5: Container Build` – Executes `docker buildx build`.
  6. `Stage 6: Trivy Vulnerability Scan` – Scans container image for CVEs.
  7. `Stage 7: Push & Deploy` – Pushes image to Docker Hub and updates target environment.
* **Key Viva Voce Q&A:**
  - **Q1: What is the difference between `npm install` and `npm ci` in a CI/CD pipeline?**  
    *Answer:* `npm install` can update `package-lock.json` and install minor/patch updates based on semver ranges (`^`, `~`), leading to non-deterministic builds. `npm ci` (Clean Install) strictly installs exact versions locked inside `package-lock.json`, removes existing `node_modules/`, and fails if there is any mismatch, ensuring deterministic, reproducible builds.
  - **Q2: How does a GitHub Webhook communicate with Jenkins securely?**  
    *Answer:* GitHub sends an HTTP POST request containing a JSON payload to the Jenkins `/github-webhook/` endpoint. Security is enforced by configuring a **Secret Token** on GitHub, which signs the payload with an HMAC-SHA256 signature passed in the `X-Hub-Signature-256` header. Jenkins verifies this signature before triggering any job.

---

### Practical 7: DevSecOps: Code Analysis, Vulnerability Scanning & Secrets Management
* **Syllabus Unit:** Unit 5 & Unit 2 (Security in DevOps)
* **Objective:** Implement DevSecOps gates using SonarQube (Static Application Security Testing - SAST), Trivy (Container vulnerability scanner), and AWS Secrets Manager for runtime credential injection.
* **Component Location:** `sonar-project.properties`, `jenkins/Jenkinsfile`, `backend/config/secrets.js`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Run local SonarQube Scanner
  sonar-scanner \
    -Dsonar.projectKey=PayTrack-2.0 \
    -Dsonar.sources=backend \
    -Dsonar.host.url=http://localhost:9000 \
    -Dsonar.login=<SONAR_TOKEN>

  # Step 2: Execute Trivy vulnerability scan against backend container image
  trivy image --severity HIGH,CRITICAL paytrack-backend:latest

  # Step 3: Run Trivy filesystem scan to detect hardcoded secrets
  trivy fs --scanners secret,vuln .

  # Step 4: Verify secret retrieval from AWS Secrets Manager
  aws secretsmanager get-secret-value --secret-id paytrack/production/credentials
  ```
* **What to Show the Examiner:**
  1. SonarQube Dashboard showing "Passed" Quality Gate, 0 Security Vulnerabilities, and test coverage percentage.
  2. Trivy terminal output displaying table of scanned OS packages and application dependencies with zero unpatched `CRITICAL` findings.
  3. Demonstration that zero `.env` files or credentials exist in GitHub repository history (`git log -S "password"` returns empty).
* **Key Viva Voce Q&A:**
  - **Q1: What does "Shift-Left Security" mean in DevSecOps?**  
    *Answer:* Traditional security testing happened at the end of the development lifecycle (before release), leading to costly, slow fixes. "Shift-Left" moves security checks earlier into the developer workflow and CI pipeline (pre-commit hooks, IDE linters, SonarQube SAST on pull requests, Trivy container scanning during build), discovering and remediating vulnerabilities when they are fastest and cheapest to solve.
  - **Q2: What is the difference between SAST and DAST?**  
    *Answer:* **SAST** (Static Application Security Testing, e.g., SonarQube) analyzes source code, bytecode, or binaries without running the application to detect coding flaws, buffer overflows, and insecure API calls. **DAST** (Dynamic Application Security Testing, e.g., OWASP ZAP) tests a running application from the outside by injecting malicious requests to find runtime vulnerabilities like SQL injection or cross-site scripting (XSS).

---

### Practical 8: Prometheus and Node Exporter Monitoring
* **Syllabus Unit:** Unit 6 (Cloud Monitoring & Observability)
* **Objective:** Deploy Prometheus as a time-series metric database, deploy Node Exporter to capture host OS/hardware telemetry, instrument custom application metrics inside Node.js Express via `prom-client`, and configure scrape jobs.
* **Component Location:** `monitoring/prometheus/prometheus.yml` and `backend/server.js`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Verify Prometheus configuration syntax
  docker run --rm -v $(pwd)/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus:latest --config.file=/etc/prometheus/prometheus.yml --dry-run

  # Step 2: Query Node Exporter metrics directly via curl
  curl -s http://localhost:9100/metrics | grep "node_cpu_seconds_total" | head -n 5

  # Step 3: Query PayTrack application custom metrics
  curl -s http://localhost:5000/metrics | grep "http_requests_total"

  # Step 4: Open Prometheus Expression Browser
  # Navigate to http://localhost:9090/targets to verify all scrape endpoints are UP
  ```
* **Sample PromQL Queries for Viva Demonstration:**
  - CPU Usage percentage:  
    `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`
  - Memory Usage percentage:  
    `((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100`
  - HTTP Request Rate per Second:  
    `sum(rate(http_requests_total[1m])) by (status_code, handler)`
* **Key Viva Voce Q&A:**
  - **Q1: Why does Prometheus use a Pull model instead of a Push model?**  
    *Answer:* In the **Pull model**, Prometheus centrally controls the scrape rate and schedule, preventing monitoring servers from being overwhelmed during traffic spikes. It also makes target health detection straightforward: if Prometheus cannot scrape a target, it automatically flags the target as `DOWN`. (For ephemeral batch jobs, Prometheus provides the Pushgateway).
  - **Q2: What are the four core metric types supported by Prometheus?**  
    *Answer:*
    1. **Counter:** A cumulative metric that only increases or resets to zero on restart (e.g., `http_requests_total`).
    2. **Gauge:** A single numerical value that can arbitrarily go up and down (e.g., CPU temperature, memory usage).
    3. **Histogram:** Samples observations (usually request durations) and counts them in configurable buckets (e.g., latency).
    4. **Summary:** Similar to histogram, but calculates configurable streaming quantiles ($P_{50}$, $P_{90}$, $P_{99}$) on the client side.

---

### Practical 9: Grafana Dashboards and Visualizations
* **Syllabus Unit:** Unit 6 (Cloud Monitoring & Observability)
* **Objective:** Connect Grafana to the Prometheus data source, design interactive multi-panel operational dashboards, visualize real-time infrastructure and application metrics, and configure visual threshold alerts.
* **Component Location:** `monitoring/grafana/provisioning/` and `docker-compose.yml`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Verify Grafana container is running on port 3001
  docker compose ps grafana

  # Step 2: Access Grafana in browser
  # URL: http://localhost:3001 (Default credentials: admin / admin)

  # Step 3: Verify Datasource auto-provisioning
  # Settings -> Data Sources -> Prometheus -> Test (Expected: "Data source is working")

  # Step 4: View the pre-loaded "PayTrack Operations" Dashboard
  ```
* **Dashboard Panels to Show the Examiner:**
  1. **Host Telemetry Gauge:** Real-time CPU Utilization (%) and Memory Consumption (GB).
  2. **API Throughput Time-Series:** Requests per second ($RPS$) segmented by HTTP status codes (2xx, 4xx, 5xx).
  3. **Response Latency Heatmap:** $P_{95}$ response time in milliseconds.
  4. **Business KPI Stat Panel:** Total SMS/WhatsApp payment reminder alerts dispatched today.
* **Key Viva Voce Q&A:**
  - **Q1: How does Grafana achieve automated provisioning without manual UI clicks?**  
    *Answer:* Grafana supports **file-based provisioning** using YAML files mounted into `/etc/grafana/provisioning/datasources/` and `/etc/grafana/provisioning/dashboards/`. On startup, Grafana reads these declarations and automatically configures data sources and renders dashboards, enabling Dashboard-as-Code (DaC).
  - **Q2: How do you configure an Alert in Grafana?**  
    *Answer:* An alert rule is configured on a metric query (e.g., $P_{95}$ latency $> 500\text{ms}$ for 5 consecutive minutes). Grafana evaluates the condition and routes alert notifications to contact points such as Slack, PagerDuty, or Webhook endpoints.

---

### Practical 10: AWS Lambda, API Gateway, CloudWatch, Cost Explorer and Budgets
* **Syllabus Unit:** Unit 6 & Unit 1 (Serverless & Cloud Financial Management)
* **Objective:** Deploy a serverless AWS Lambda function integrated with Amazon API Gateway to ingest payment webhooks; monitor executions and errors in CloudWatch; configure AWS Cost Explorer allocation tags and establish AWS Budgets alerts.
* **Component Location:** `infrastructure/cloudformation/serverless.yml` and `lambda/webhookHandler.js`.
* **Step-by-Step Terminal Commands:**
  ```bash
  # Step 1: Package and deploy serverless stack via AWS CloudFormation
  aws cloudformation deploy \
    --template-file infrastructure/cloudformation/serverless.yml \
    --stack-name PayTrack-Serverless-Stack \
    --capabilities CAPABILITY_IAM

  # Step 2: Retrieve API Gateway webhook endpoint URL
  WEBHOOK_URL=$(aws cloudformation describe-stacks \
    --stack-name PayTrack-Serverless-Stack \
    --query "Stacks[0].Outputs[?OutputKey=='WebhookApiUrl'].OutputValue" --output text)
  echo "Webhook Endpoint: $WEBHOOK_URL"

  # Step 3: Trigger Lambda function via HTTP POST request to API Gateway
  curl -i -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"paymentId":"PAY-12345","amount":1500,"status":"SUCCESS","customerPhone":"+919876543210"}'

  # Step 4: Stream real-time CloudWatch Logs for the Lambda execution
  aws logs tail /aws/lambda/PayTrack-PaymentWebhookHandler --follow

  # Step 5: Verify AWS Budget configuration
  aws budgets describe-budgets --account-id $(aws sts get-caller-identity --query "Account" --output text)
  ```
* **What to Show the Examiner:**
  1. API Gateway POST request returning HTTP `200 OK` with JSON acknowledgment.
  2. CloudWatch Log Streams displaying execution duration, memory used, and billing duration (e.g., `Billed Duration: 42 ms`).
  3. AWS Budgets Console showing monthly budget limit of \$5.00 with email alert notification configured for 80% and 100% thresholds.
* **Key Viva Voce Q&A:**
  - **Q1: What are the main architectural advantages of Serverless computing with AWS Lambda?**  
    *Answer:*
    1. **Zero Server Management:** No OS patching, instance provisioning, or runtime maintenance.
    2. **Automatic Elastic Scaling:** Automatically scales from zero to thousands of concurrent requests in response to traffic bursts.
    3. **Pay-per-use Billing:** Billed strictly per millisecond of compute execution time; zero idle cost when traffic is absent.
  - **Q2: What is "Cold Start" in AWS Lambda and how can it be mitigated?**  
    *Answer:* A cold start occurs when an invocation requests a new execution environment (downloading code, initializing runtime, and running setup code outside the handler). It can be mitigated by choosing lightweight runtimes (Node.js/Python), minimizing package size, using **Provisioned Concurrency**, or configuring periodic warm-up pings.
  - **Q3: How do you enforce cloud cost control in an enterprise AWS environment?**  
    *Answer:* By configuring **AWS Budgets** with custom thresholds and SNS notifications, activating **Cost Allocation Tags** to track departmental spending in **AWS Cost Explorer**, setting CloudWatch log group expiration retention rules, enforcing termination of idle non-production instances via Lambda schedules, and using AWS Compute Optimizer for rightsizing.
