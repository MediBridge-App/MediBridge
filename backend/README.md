# MediBridge Backend

## Digital Healthcare Document Exchange Platform

MediBridge is a secure healthcare document exchange platform that enables organizations to securely upload, exchange, process, and track medical documents between healthcare providers.

The backend provides APIs for authentication, document management, AI analysis integration, auditing, notifications, organization management, and security settings.

---

# Table of Contents

- [MediBridge Backend](#medibridge-backend)
  - [Digital Healthcare Document Exchange Platform](#digital-healthcare-document-exchange-platform)
- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
  - [Authentication](#authentication)
  - [Document Management](#document-management)
  - [AI Analysis Integration](#ai-analysis-integration)
  - [Audit Logging](#audit-logging)
  - [Notifications](#notifications)
  - [Organization Management](#organization-management)
  - [Security Settings](#security-settings)
  - [API Key Management](#api-key-management)
- [Technology Stack](#technology-stack)
  - [Backend](#backend)
  - [Database](#database)
  - [Cloud Services](#cloud-services)
  - [Deployment](#deployment)
- [System Architecture](#system-architecture)
- [AWS Cloud Infrastructure](#aws-cloud-infrastructure)
  - [Amazon ECS Fargate](#amazon-ecs-fargate)
  - [Amazon RDS PostgreSQL](#amazon-rds-postgresql)
  - [Amazon S3](#amazon-s3)
  - [AWS Cognito](#aws-cognito)
  - [AWS Secrets Manager](#aws-secrets-manager)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
  - [Organizations](#organizations)
  - [Users](#users)
  - [Documents](#documents)
  - [AI Analysis](#ai-analysis)
- [Authentication and Security](#authentication-and-security)
  - [User Authentication](#user-authentication)
  - [Internal API Authentication](#internal-api-authentication)
- [Document Upload Workflow](#document-upload-workflow)
- [AI Processing Workflow](#ai-processing-workflow)
- [API Documentation](#api-documentation)
- [Local Development Setup](#local-development-setup)
  - [Clone Repository](#clone-repository)

---

# Overview

Healthcare organizations often need to exchange sensitive documents such as:

- Referrals
- Laboratory results
- Imaging reports
- Discharge summaries
- Insurance documents

MediBridge provides a centralized digital exchange system where healthcare organizations can securely send and receive documents while maintaining:

- Authentication
- Authorization
- Audit tracking
- Document status workflows
- AI-powered analysis
- Secure cloud storage

---

# Features

## Authentication

Implemented secure user authentication using AWS Cognito.

Features:

- User login
- JWT access token validation
- Protected API routes
- User identity verification
- Organization-based access control


---

## Document Management

Implemented complete document exchange workflow.

Features:

- Upload documents
- Generate secure S3 upload URLs
- Send documents between organizations
- Track document status
- Search documents
- Filter by:
  - Document type
  - Status
  - Priority

Supported document types:

- Referral
- Lab Result
- Discharge Summary
- Insurance Form
- Imaging


Document statuses:

- Uploaded
- OCR Complete
- Classified
- Routed
- Delivered


---

## AI Analysis Integration

Integrated backend support for AI document processing.

Features:

- AI-generated summaries
- Document classification
- Confidence scoring
- Recommendation generation
- Urgency detection
- Processing metadata storage


The backend supports AI services sending results through an internal authenticated API.

---

## Audit Logging

Implemented audit tracking for important system events.

Tracks:

- User actions
- Document events
- Organization events
- AI processing events

Each audit record contains:

- Event ID
- User
- Organization
- Document
- Action
- Timestamp
- Additional details


---

## Notifications

Supports user notifications for:

- Document delivery
- Document reading
- Urgent documents
- AI processing completion
- Audit events


---

## Organization Management

Supports:

- Healthcare organization profiles
- Organization settings
- User organization relationships
- Organization-level permissions


---

## Security Settings

Implemented organization security configuration.

Includes:

- MFA settings
- IP allowlisting settings
- Session timeout configuration
- Security scan tracking


---

## API Key Management

Supports internal service authentication.

Used for:

- AI Lambda integration
- Internal backend services
- External integrations


---

# Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic


## Database

- PostgreSQL
- Amazon RDS


## Cloud Services

- AWS ECS Fargate
- AWS Cognito
- Amazon S3
- AWS Secrets Manager
- AWS Lambda
- Amazon Bedrock integration


## Deployment

- Docker
- Amazon ECR
- ECS Fargate


---

# System Architecture
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
 RDS PostgreSQL   S3          AI Services
    |              |               |
    |              |               |
    
Application Documents Lambda/Bedrock
Data Processing


---

# AWS Cloud Infrastructure

## Amazon ECS Fargate

The FastAPI backend runs as a containerized application using ECS Fargate.

Benefits:

- No server management
- Automatic container deployment
- Scalable backend hosting
- Production-ready infrastructure


---

## Amazon RDS PostgreSQL

Stores application data.

Database tables include:

- organizations
- users
- documents
- ai_analyses
- audit_logs
- notifications
- tasks
- api_keys
- security_settings
- user_notification_preferences
- webhooks


---

## Amazon S3

Used for secure healthcare document storage.

Implementation:

- Presigned upload URLs
- UUID-based object keys
- Server-side encryption
- Limited upload expiration time


Document upload flow:

Frontend
|
|
Request Upload URL
|
|
FastAPI
|
|
Generate Presigned S3 URL
|
|
Frontend uploads directly to S3


---

## AWS Cognito

Used for:

- User authentication
- JWT token generation
- Identity management


Authentication flow:
 User Login
|
AWS Cognito
|
JWT Access Token
|
FastAPI Validation
|
Authorized Request



---

## AWS Secrets Manager

Used to securely store:

- Database credentials
- Application secrets
- API keys


The backend retrieves database credentials during startup instead of storing passwords in code.

---

# Backend Architecture

Project structure:
backend/

├── main.py

├── models/
│ ├── user.py
│ ├── document.py
│ ├── organization.py
│ ├── ai_analysis.py
│ ├── audit.py
│ └── notifications.py

├── schemas/
│ ├── documents.py
│ ├── users.py
│ ├── ai.py
│ └── organizations.py

├── routes/
│ ├── documents.py
│ ├── auth.py
│ ├── ai.py
│ ├── audit.py
│ └── notifications.py

├── dependencies/
│ ├── auth.py
│ └── internal_api.py

├── services/
│ ├── s3.py
│ └── audit.py


---

# Database Design

Main entities:

## Organizations

Stores healthcare organizations.

Example:

- Hospital
- Clinic
- Provider organization


---

## Users

Stores:

- User identity
- Role
- Organization membership
- Provider information


Supported roles:

- Organization Admin
- Provider
- Registered Nurse
- Referral Coordinator
- Medical Assistant


---

## Documents

Stores:

- Sender organization
- Recipient organization
- Document metadata
- File location
- Status
- Priority


---

## AI Analysis

Stores:

- AI summary
- Tags
- Recommendations
- Confidence score
- Processing information


---

# Authentication and Security

## User Authentication

Protected endpoints require:


Authorization: Bearer <JWT Token>


The backend:

1. Receives JWT token
2. Validates Cognito signature
3. Confirms user identity
4. Loads user from database
5. Authorizes request


---

## Internal API Authentication

AI ingestion endpoint requires:


X-API-Key: <internal key>


Used for:

- Lambda services
- AI processing pipelines


---

# Document Upload Workflow

User selects document
Frontend requests upload URL
Backend generates S3 presigned URL
Frontend uploads document to S3
Document metadata stored in PostgreSQL
Document becomes available for exchange

---

# AI Processing Workflow


Document Uploaded

    |
    |

AWS Lambda Processing

    |
    |

AI Model Processing

    |
    |

POST /internal/ai/analyses

    |
    |

FastAPI Backend

    |
    |

ai_analyses table updated

    |
    |

Document status updated

    |
    |

Audit event created


---

# API Documentation

Interactive API documentation is available through FastAPI Swagger:


/docs


Example:


http://localhost:8000/docs



Detailed API documentation:




---

# Local Development Setup

## Clone Repository

```bash
git clone <repository-url>

cd backend
Create Virtual Environment
python -m venv venv

Activate:

Mac/Linux:

source venv/bin/activate

Windows:

venv\Scripts\activate
Install Dependencies
pip install -r requirements.txt
Run Backend
uvicorn main:app --reload

Backend runs at:

http://localhost:8000
Environment Variables

Create .env:

AWS_REGION=

COGNITO_USER_POOL_ID=

COGNITO_CLIENT_ID=

DB_SECRET_ARN=

DB_HOST=

DB_PORT=

DB_NAME=

S3_BUCKET_NAME=

AI_INTERNAL_API_KEY=

FRONTEND_URL=
Deployment

Deployment workflow:

Developer

   |
   |

Docker Build

   |
   |

Amazon ECR

   |
   |

ECS Fargate

   |
   |

Production Backend
Developer Contribution
Backend Engineer: Bella

Implemented:

Backend Development
FastAPI application setup
API routing
SQLAlchemy database models
Pydantic schemas
Database integration
Error handling
Authentication
AWS Cognito integration
JWT verification
Protected routes
User authorization
Document System
Document APIs
S3 presigned upload flow
Document status management
Search functionality
AI Integration
AI analysis database model
AI response schemas
Internal Lambda ingestion endpoint
API key authentication
AI audit workflow
Security
API key management
Audit logging
Security settings
Secrets Manager integration
Cloud Infrastructure
Docker configuration
ECS deployment preparation
AWS service integration
RDS connection
S3 storage workflow

Project Status

MediBridge backend provides a complete foundation for a secure healthcare document exchange platform with cloud deployment architecture and AI processing integration.