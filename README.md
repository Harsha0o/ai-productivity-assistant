# AI-Powered Task Manager - Complete Project Guide

A production-ready task management application with AI capabilities, deployed on AWS.

**Live App**: https://dvu4osrtasq7b.cloudfront.net

---

##  What This Project Does

This is a **full-stack task manager** that lets you:
-  Create, edit, delete, and complete tasks
-  Use **AI to create tasks** from natural language (e.g., "Call mom tomorrow at 5pm")
-  Get **AI-powered productivity insights**
-  All running on **AWS cloud infrastructure**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
│                           │                                     │
│                           ▼                                     │
│              ┌─────────────────────────┐                        │
│              │      CloudFront CDN     │ ← HTTPS, Global Cache  │
│              │  dvu4osrtasq7b.cloudfront.net                    │
│              └─────────────────────────┘                        │
│                     │           │                               │
│           ┌─────────┘           └─────────┐                     │
│           ▼                               ▼                     │
│    ┌─────────────┐                ┌─────────────┐               │
│    │  S3 Bucket  │                │     ALB     │               │
│    │  (Frontend) │                │ (Load Bal.) │               │
│    │  React App  │                └──────┬──────┘               │
│    └─────────────┘                       │                      │
│                                          ▼                      │
│                                  ┌─────────────┐                │
│                                  │     EC2     │                │
│                                  │  (Backend)  │                │
│                                  │   FastAPI   │                │
│                                  └──────┬──────┘                │
│                                         │                       │
│                    ┌────────────────────┼────────────────────┐  │
│                    ▼                    ▼                    │  │
│            ┌─────────────┐      ┌─────────────┐              │  │
│            │     RDS     │      │  Gemini AI  │              │  │
│            │ PostgreSQL  │      │   (Google)  │              │  │
│            └─────────────┘      └─────────────┘              │  │
│                                                                 │
│                        AWS Cloud (us-east-1)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
task-manager/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── components/
│   │   │   ├── AIInput.jsx      # AI task creation
│   │   │   ├── InsightsPanel.jsx # AI insights
│   │   │   ├── TaskForm.jsx     # Manual task form
│   │   │   ├── TaskItem.jsx     # Single task display
│   │   │   └── TaskList.jsx     # List of tasks
│   │   └── services/
│   │       └── api.js           # API calls
│   └── package.json
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── main.py              # App entry point
│   │   ├── config.py            # Settings
│   │   ├── database.py          # DB connection
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Request/Response schemas
│   │   ├── routers/
│   │   │   ├── tasks.py         # CRUD endpoints
│   │   │   └── ai.py            # AI endpoints
│   │   └── services/
│   │       └── ai_service.py    # Gemini AI integration
│   └── requirements.txt
│
└── infrastructure/           # Terraform (AWS)
    ├── main.tf              # Main config
    ├── vpc.tf               # Network setup
    ├── security_groups.tf   # Firewall rules
    ├── rds.tf               # Database
    ├── ec2.tf               # Server
    ├── alb.tf               # Load balancer
    ├── s3.tf                # Frontend storage
    ├── cloudfront.tf        # CDN
    ├── variables.tf         # Variables
    ├── outputs.tf           # Output values
    └── terraform.tfvars     # Your values
```

---

##  Technologies Used

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React | User interface |
| **Styling** | Tailwind CSS | Modern styling |
| **Backend** | FastAPI (Python) | REST API |
| **Database** | PostgreSQL | Data storage |
| **AI** | Google Gemini | Natural language processing |
| **Infrastructure** | Terraform | Infrastructure as Code |
| **Cloud** | AWS | Hosting everything |

### AWS Services Used:
- **VPC** - Private network
- **EC2** - Virtual server for backend
- **RDS** - Managed PostgreSQL database
- **ALB** - Load balancer for backend
- **S3** - Static file storage for frontend
- **CloudFront** - CDN for fast global access

---

## How It Works

### 1. User Opens the App
1. User visits `https://dvu4osrtasq7b.cloudfront.net`
2. CloudFront serves the React app from S3
3. The React app loads in the browser

### 2. Creating a Task with AI
1. User types: "Finish report by Friday urgent"
2. Frontend sends request to `/ai/parse-and-create`
3. CloudFront routes `/ai/*` to the ALB
4. ALB forwards to the EC2 backend
5. Backend calls Gemini AI to parse the text
6. AI extracts: title, priority (urgent), category, due date
7. Task is saved to PostgreSQL database
8. Response sent back to frontend
9. Task appears in the list!

### 3. Regular Task Operations
- **GET /tasks** - Fetch all tasks
- **POST /tasks** - Create a task manually
- **PUT /tasks/{id}** - Update a task
- **DELETE /tasks/{id}** - Delete a task

---

##  Key Features Explained

### AI Natural Language Parsing
```
Input: "Call mom tomorrow at 5pm"

AI Output:
{
  "title": "Call mom",
  "priority": "medium",
  "category": "personal",
  "due_date": "2024-01-02T17:00:00"
}
```

### AI Productivity Insights
The AI analyzes your tasks and provides:
- Completion rate statistics
- Tasks by category breakdown
- Personalized productivity tips

---

##  Security Features

1. **Private Subnets** - Database and EC2 not directly accessible
2. **Security Groups** - Firewall rules control access
3. **HTTPS Only** - All traffic encrypted via CloudFront
4. **No Public DB** - RDS only accessible from within VPC

---

##  Cost Breakdown (Approximate)

| Service | Monthly Cost |
|---------|-------------|
| EC2 (t3.micro) | ~$8 |
| RDS (t3.micro) | ~$15 |
| ALB | ~$16 |
| CloudFront | ~$1 |
| S3 | ~$0.50 |
| **Total** | **~$40/month** |

> **Tip**: Run `terraform destroy` when not using to avoid charges!

---

##  Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your-key"
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

##  Deployment Commands

### Deploy Frontend
```bash
cd frontend
npm run build
aws s3 sync build/ s3://task-manager-frontend-c4el7g0r/ --delete
```

### Deploy Backend (via EC2 Session Manager)
```bash
cd /opt/taskmanager
aws s3 cp s3://task-manager-frontend-c4el7g0r/deploy.sh /tmp/deploy.sh
sudo bash /tmp/deploy.sh
```

### Apply Infrastructure Changes
```bash
cd infrastructure
terraform apply
```

---

##  Cleanup (Stop AWS Charges)

```bash
cd infrastructure
terraform destroy
```

This will delete all AWS resources and stop all charges.

---

##  Skills Demonstrated

This project showcases:

| Category | Skills |
|----------|--------|
| **Frontend** | React, State Management, API Integration |
| **Backend** | Python, FastAPI, REST APIs, SQLAlchemy |
| **Database** | PostgreSQL, ORM, Migrations |
| **AI/ML** | LLM Integration, Prompt Engineering |
| **Cloud** | AWS (VPC, EC2, RDS, ALB, S3, CloudFront) |
| **DevOps** | Terraform, Infrastructure as Code |
| **Security** | CORS, HTTPS, Network Security |

---

##  What You Learned

1. **Full-Stack Development** - Building frontend and backend
2. **Cloud Architecture** - Designing scalable AWS infrastructure
3. **Infrastructure as Code** - Using Terraform
4. **AI Integration** - Using LLMs in production
5. **Production Deployment** - Real-world deployment practices

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger documentation |
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create a task |
| GET | `/tasks/{id}` | Get a task |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |
| GET | `/ai/status` | Check if AI is available |
| POST | `/ai/parse` | Parse text to task structure |
| POST | `/ai/parse-and-create` | Parse and create task |
| GET | `/ai/insights` | Get productivity insights |

---

**Built using FastAPI, React, PostgreSQL, Terraform, AWS, and Google Gemini AI**
