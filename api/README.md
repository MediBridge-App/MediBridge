# MediBridge API

## Digital Healthcare Document Exchange Platform

MediBridge is a secure healthcare document exchange platform that enables healthcare organizations to upload, exchange, process, and track medical documents.

The backend provides REST APIs for authentication, document management, AI processing integration, auditing, organization management, user management, notifications, and security configuration.

---

# Table of Contents

* Overview
* Features
* Technology Stack
* System Architecture
* AWS Infrastructure
* Backend Architecture
* Database Design
* Authentication and Security
* Document Workflow
* AI Processing Workflow
* API Documentation
* Local Development Setup
* Deployment

---

# Overview

Healthcare organizations exchange many types of sensitive documents, including:

* Referrals
* Laboratory results
* Imaging reports
* Discharge summaries
* Insurance documents

MediBridge provides a centralized platform for secure document exchange with:

* Organization-based access control
* Secure cloud document storage
* Document status tracking
* AI-powered document analysis
* Audit logging
* Event-driven processing

---

# Features

## Authentication

Authentication is handled through AWS Cognito.

Features:

* JWT authentication
* Protected API endpoints
* User identity validation
* Organization-based authorization
* Role-based access control

---

## Document Management

The document system supports the complete document exchange lifecycle.

Features:

* Generate secure S3 upload URLs
* Upload documents securely
* Send documents between organizations
* View inbox documents
* View sent documents
* Search documents
* Filter documents by:

  * Status
  * Document type
  * Priority
* Generate secure download URLs
* Track document reads
* Update document workflow status

Supported document types:

* Referral
* Lab Result
* Discharge Summary
* Insurance Form
* Imaging

Supported statuses:

* Uploaded
* OCR Complete
* Classified
* Routed
* Delivered

Supported priorities:

* Urgent
* Normal
* Routine

---

## AI Analysis Integration

MediBridge integrates with AI processing services through a secure internal API.

Features:

* AI-generated summaries
* Document classification
* Tag generation
* Urgency detection
* AI processing metadata storage
* AI workflow auditing

The backend receives AI results through:

```
POST /internal/ai/analyses
```

Authentication:

```
X-API-Key: <internal key>
```

---

## Audit Logging

The backend records important system events.

Tracked events include:

* Document sent
* Document downloaded
* Document read
* Document status changes
* AI processing completion
* Organization activity

Each audit record contains:

* Event type
* Action
* User
* Organization
* Document reference
* Timestamp
* Additional metadata

---

## Notifications

Supports system notifications for:

* Document delivery
* Document activity
* AI processing events
* User notification preferences

---

## Organization and User Management

Supports:

* Healthcare organizations
* Organization settings
* User profiles
* Organization membership
* Role management

---

# Technology Stack

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Alembic

## Database

* PostgreSQL
* Amazon RDS

## Cloud Services

* AWS ECS Fargate
* AWS Cognito
* Amazon S3
* Amazon SNS
* Amazon SQS
* AWS Lambda
* AWS Secrets Manager
* Amazon Bedrock integration

## Deployment

* Docker
* Amazon ECR
* ECS Fargate

---

# System Architecture

```
                 Frontend
                    |
                    |
              AWS Cognito
                    |
                    |
              JWT Authentication
                    |
                    |
             FastAPI Backend
                    |
      --------------------------------
      |              |               |
      |              |               |
 PostgreSQL        S3          AWS Services
      |              |               |
      |              |               |
 Database      Documents       SNS/SQS/Lambda
```

---

# AWS Infrastructure

## Amazon ECS Fargate

The FastAPI application runs as a containerized service using ECS Fargate.

Provides:

* Serverless container hosting
* Scalable deployment
* Production environment

---

## Amazon RDS PostgreSQL

Stores application data.

Main tables:

* organizations
* users
* documents
* ai_analyses
* audit_logs
* notifications
* security_settings
* api_keys

---

## Amazon S3

Used for secure healthcare document storage.

Implementation:

* Presigned upload URLs
* Presigned download URLs
* UUID-based object keys
* Server-side encryption

---

## Amazon SNS and SQS

MediBridge uses event-driven processing for document workflows.

Document send flow:

```
User sends document

        |

POST /documents/send

        |

Document stored in PostgreSQL

        |

Audit event created

        |

document.sent event published

        |

Amazon SNS Topic

        |

Amazon SQS Queue

        |

AI Processing Lambda
```

SNS Topic:

```
medibridge-dev-document-events
```

---

## AWS Cognito

Used for:

* User authentication
* JWT token generation
* Identity verification

Authentication flow:

```
User Login

    |

AWS Cognito

    |

JWT Token

    |

FastAPI Validation

    |

Authorized API Request
```

---

## AWS Secrets Manager

Stores:

* Database credentials
* Application secrets
* Internal API keys

---

# Backend Architecture

Project structure:

```
api/

├── main.py
├── database.py

├── models/
│   ├── user.py
│   ├── document.py
│   ├── organization.py
│   ├── ai_analysis.py
│   └── audit.py

├── schemas/
│   ├── document.py
│   ├── user.py
│   ├── organization.py
│   └── internal_ai.py

├── routes/
│   ├── documents.py
│   ├── auth.py
│   ├── users.py
│   ├── organizations.py
│   ├── audit.py
│   └── internal_ai.py

├── dependencies/
│   ├── auth.py
│   └── internal_auth.py

├── services/
│   ├── s3.py
│   ├── audit.py
│   └── events.py

├── migrations/

├── seed/

├── Dockerfile

└── requirements.txt
```

---

# Database Design

## Organizations

Stores healthcare organization information.

Examples:

* Hospitals
* Clinics
* Provider organizations

---

## Users

Stores:

* User identity
* Organization membership
* Roles
* Account status

Supported roles:

* Organization Admin
* Provider
* Registered Nurse
* Referral Coordinator
* Medical Assistant

---

## Documents

Stores:

* Sender organization
* Recipient organization
* Document metadata
* S3 file location
* Status
* Priority
* Workflow timestamps

---

## AI Analysis

Stores:

* AI summary
* Tags
* Urgency detection
* Model information
* Processing metadata

---

# Authentication and Security

## User Authentication

Protected endpoints require:

```
Authorization: Bearer <JWT Token>
```

The backend:

1. Validates Cognito JWT
2. Identifies user
3. Loads organization membership
4. Authorizes access

---

## Internal Service Authentication

AI services authenticate using:

```
X-API-Key
```

Used for:

* Lambda integration
* AI processing pipeline
* Internal services

---

# API Documentation

Interactive Swagger documentation:

```
/docs
```

Example:

```
http://localhost:8000/docs
```

API groups:

* Authentication
* Documents
* Internal AI
* Organizations
* Users
* Audit Logs
* Notifications
* Security Settings
* API Keys

Swagger provides:

* Request schemas
* Response schemas
* Authentication testing
* Endpoint details

---

# Local Development Setup

## Clone Repository

```bash
git clone (https://github.com/MediBridge-App/MediBridge.git)

cd api
```

## Create Virtual Environment

```bash
python -m venv venv
```

Activate:

Mac/Linux:

```bash
source venv/bin/activate
```

Windows:

```bash
venv\Scripts\activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Backend

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

# Environment Variables

Required environment variables:

```
AWS_REGION=

COGNITO_USER_POOL_ID=

COGNITO_CLIENT_ID=

DB_HOST=

DB_PORT=

DB_NAME=

DB_SECRET_ARN=

S3_BUCKET_NAME=

DOCUMENT_BUCKET=

EVENTS_TOPIC_ARN=

AI_INTERNAL_API_KEY=

FRONTEND_URL=
```

---

# Deployment

Deployment workflow:

```
Developer

    |

Docker Build

    |

Amazon ECR

    |

ECS Task Definition

    |

ECS Fargate

    |

Production Backend
```

---

# Project Contribution

Backend Engineer: Bella

Implemented:

## Backend Development

* FastAPI application structure
* REST API development
* SQLAlchemy models
* Pydantic schemas
* Database integration
* Error handling

## Authentication

* AWS Cognito integration
* JWT validation
* Protected routes
* Organization authorization

## Document Platform

* Document exchange APIs
* S3 upload workflow
* Document search
* Document status management
* Secure downloads

## AI Integration

* AI analysis model
* Internal AI endpoint
* API key authentication
* SNS event publishing
* Lambda processing integration

## Security

* Audit logging
* Secrets Manager integration
* API key management

## Cloud Infrastructure

* Docker containerization
* Amazon ECR deployment
* ECS Fargate configuration
* AWS service integration

---

# Project Status

MediBridge provides a complete backend foundation for a secure healthcare document exchange platform with:

* Cloud deployment architecture
* Secure document storage
* AI-powered processing
* Event-driven workflows
* Organization-based access control
* Full audit tracking
