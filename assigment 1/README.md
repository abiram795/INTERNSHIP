# API C2C – LinkedIn Job Search & Recruiter Email Automation

> **Enterprise-grade automation platform for US IT recruiters and staffing professionals.**  
> Automatically searches LinkedIn posts, applies rigorous 24-hour and US location filters, extracts verified recruiter contact details, formats customized pitch templates, and routes emails through a supervised administrator approval workflow for Gmail API transmission.

---

## 📋 Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture](#2-system-architecture)
- [3. Technology Stack](#3-technology-stack)
- [4. Core Features](#4-core-features)
- [5. LinkedIn Data Provider Interface](#5-linkedin-data-provider-interface)
- [6. Post Filtering Logic](#6-post-filtering-logic)
- [7. Recruiter Extraction & Email Verification](#7-recruiter-extraction--email-verification)
- [8. Supervised Email Automation & Gmail API](#8-supervised-email-automation--gmail-api)
- [9. Database Design & Models](#9-database-design--models)
- [10. REST API Specification](#10-rest-api-specification)
- [11. Interactive Admin Dashboard](#11-interactive-admin-dashboard)
- [12. Installation & Quick Start](#12-installation--quick-start)
- [13. Running Automated Tests](#13-running-automated-tests)
- [14. Production Deployment & Security](#14-production-deployment--security)

---

## 1. Executive Summary

In US IT consulting and staffing (specifically Corp-to-Corp / C2C and W2), speed-to-market and candidate placement velocity are paramount. Relevant job opportunities and consultant hotlists posted on LinkedIn expire rapidly within 24 hours.

This platform automates the discovery-to-outreach pipeline while adhering strictly to LinkedIn and Google Developer Terms of Service:
- **No scraping or anti-bot bypasses**: Utilizes authorized API interfaces and an authentic, realistic mock data provider for compliant development and evaluation.
- **Strict Human-in-the-Loop Supervision**: Email drafts are generated automatically in `PENDING_APPROVAL` status. No email is transmitted without explicit administrator review and authorization.
- **Data Integrity**: Never invents or infers private email addresses. Uses RFC 5322 regex, disposable domain blocking, and role account checks.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Data_Ingestion["1. Data Ingestion & Search"]
        A[Scheduled / Manual Trigger] --> B[Search Keywords Loop]
        B -->|Keyword 1: Java Developer C2C| C[LinkedIn Data Provider]
        B -->|Keyword 2: Bench| C
        B -->|Keyword 3: Sales| C
        B -->|Keyword 4: W2| C
        B -->|Keyword 5: Full-Time| C
        B -->|Keyword 6: Hotlist| C
        C --> D[(linkedin_posts Table)]
    end

    subgraph Filtering_Engine["2. Post Filtering Engine"]
        D --> E{Published < 24h?}
        E -- No --> E_Discard[Mark is_within_24h = False]
        E -- Yes --> F{US-Based Opportunity?}
        F -- No --> F_Discard[Mark is_us_based = False]
        F -- Yes --> G[Eligible US Post]
    end

    subgraph Extraction_Validation["3. Extraction & Validation"]
        G --> H[Recruiter Service]
        H --> I[Extract Name, Job Title, Job Type]
        H --> J[Extract Recruiter Email]
        J --> K[Email Validator]
        K -->|RFC 5322 Syntax Check| L{Valid?}
        K -->|Disposable Domain Check| L
        L -- Valid --> M[(recruiters Table)]
    end

    subgraph Supervised_Campaigns["4. Supervised Email Pipeline"]
        M --> N[Email Service Engine]
        N --> O[Jinja2 Template Renderer]
        O --> P[(email_campaigns Table: PENDING_APPROVAL)]
        P --> Q[Admin Dashboard Review]
        Q -->|Admin Edits & Approves| R[Status: APPROVED]
        R -->|Admin Clicks Send| S[Gmail API / OAuth 2.0]
        S --> T[Recruiter Inbox]
        S --> U[(email_logs Table)]
    end
```

---

## 3. Technology Stack

- **Backend**: Python 3.11+ / 3.14, FastAPI, Pydantic v2, SQLAlchemy 2.0, APScheduler 3.11, Jinja2.
- **Frontend**: HTML5, Responsive CSS3 (Custom Design System with CSS variables), Vanilla JavaScript SPA.
- **Database**: SQLite for initial and local development; PostgreSQL / Supabase supported out-of-the-box via SQLAlchemy connection string.
- **Email Transmission**: Gmail REST API v1 using Google OAuth 2.0 with a fallback high-fidelity simulation engine for demo environments.
- **Testing**: Pytest, Starlette TestClient, Requests.

---

## 4. Core Features

### A. LinkedIn Target Keyword Search
Supports independent querying for the six primary industry keywords:
1. `Java Developer C2C`
2. `Bench`
3. `Sales`
4. `W2`
5. `Full-Time`
6. `Hotlist`

### B. Strict Filtering Rules
- **Time Filter**: Strictly within the last 24 hours (`now_utc - 24 hours <= publication_date <= now_utc + clock_skew`).
- **Location Filter**: Identifies US locations across all 50 states (e.g. CA, TX, NY, NJ, NC, IL, FL, GA), major metros (San Jose, Dallas, Austin, NYC), and terms like "US Remote", "United States", and "CST/EST".
- **Non-US Exclusion**: Rejects posts from UK, London, India, Bangalore, Europe, Canada, or posts lacking sufficient evidence of being US-based.

### C. Recruiter Information Extraction & Verification
- Extracts: Recruiter Name, Recruiter Email, Company Name, Job Title, Location, Engagement Type (C2C, W2, Full-Time), LinkedIn URL, Publication Date.
- Email Verification:
  - RFC 5322 format compliance.
  - Disposable email blocking (Mailinator, TempMail, GuerrillaMail, etc.).
  - Generic / Role accounts detection (`support@`, `noreply@`, `billing@`).
  - Duplicate detection to prevent re-contacting the same recruiter.

### D. Administrator Supervised Email Approval Workflow
- Generates personalized HTML email drafts from `templates/email_template.html`.
- Populates recruiter name, job title, company, sender credentials, and candidate qualifications.
- **Strict safety rule**: Emails are never sent automatically. The administrator reviews the generated draft, can edit the subject/body in real-time, inspects the rendered preview, and approves before transmission.

---

## 5. LinkedIn Data Provider Interface

The platform decouples data retrieval via the abstract base class `LinkedInDataProviderInterface`:

```python
class LinkedInDataProviderInterface(ABC):
    @abstractmethod
    def search_posts(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        pass
```

- **`OfficialLinkedInDataProvider`**: Connects to the official LinkedIn Developer APIs (e.g. Community Management API / UGC Posts) using an authorized Bearer token.
- **`MockLinkedInDataProvider`**: Activated when API credentials are not set (`LINKEDIN_USE_MOCK=true`). Generates rich, authentic job postings featuring real recruiter signatures, diverse publication times (both <24h and >24h), and both US and non-US locations for testing filters.

---

## 6. Post Filtering Logic

The filter service evaluates incoming posts across three dimensions:

| Filter | Target Requirement | Implementation Detail |
|---|---|---|
| **Date Filter** | Published within last 24 hours | Timezone-aware UTC normalization. Flags `is_within_24h` as `True` or `False`. |
| **Location Filter** | US-based job opportunities | 50 US state codes (`\b(CA\|TX\|NY\|NJ\|...)\b`), metros, and remote tags. Flags `is_us_based`. |
| **Exclusion Filter** | Non-US opportunities | Detects international hubs (e.g. London, Bangalore) and flags `is_us_based = False`. |

---

## 7. Recruiter Extraction & Email Verification

Extraction strictly follows the principle: **Never invent or hallucinate contact details.**
1. **Email Extraction**: Evaluates post body using RFC-compliant pattern `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`.
2. **Name Extraction**: Parses sign-off blocks (`Thanks & Regards`, `Contact:`, `Reach me at:`) or falls back to verified post author.
3. **Email Validation**:
   - `VALID`: Syntax compliant, valid business domain, non-disposable.
   - `RISKY`: Role-based account (`admin@`, `support@`).
   - `INVALID`: Malformed syntax or disposable domain (`@mailinator.com`).

---

## 8. Supervised Email Automation & Gmail API

### Sending Lifecycle:
1. `DRAFT / PENDING_APPROVAL`: Generated upon post extraction.
2. `APPROVED`: Admin explicitly clicks "Approve" after reviewing content.
3. `SENT`: Successfully transmitted via Gmail API or Simulated engine.
4. `CANCELLED`: Rejected by administrator.

### Gmail API Integration:
When Google Cloud credentials (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`) are configured, the service initializes `googleapiclient.discovery.build("gmail", "v1", credentials=creds)` to send multipart MIME messages.

When in local evaluation mode (`GMAIL_USE_MOCK=true`), the service records a simulated Gmail Message ID (`gmail_sim_...`), logs the complete payload, and records the event in the database audit log.

---

## 9. Database Design & Models

The database schema is organized into six relational tables with complete index coverage:

1. **`linkedin_posts`**: Stores external post ID, URL, content, author, company, publication timestamp, matched keyword, `is_us_based`, `is_within_24h`, detected location.
2. **`recruiters`**: Stores extracted recruiter name, email, company, job title, location, engagement type (`C2C`, `W2`, `Full-Time`), validation status (`VALID`, `RISKY`, `INVALID`), and foreign key to `linkedin_posts`.
3. **`email_campaigns`**: Stores rendered email drafts, subject, body, recipient details, lifecycle status (`PENDING_APPROVAL`, `APPROVED`, `SENT`, `FAILED`, `CANCELLED`), generation, approval, and send timestamps.
4. **`email_logs`**: Immutable audit trail of every email action (`GENERATED`, `APPROVED`, `SENT`, `SEND_FAILED`, `REJECTED`) with timestamps and diagnostic details.
5. **`search_history`**: Audit log of keyword search runs with metrics on posts found, posts saved, and recruiters extracted.
6. **`application_settings`**: Key-value application store managing search keywords, frequencies, automation toggles, and sender profile details.

---

## 10. REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System heartbeat and version check |
| `GET` | `/api/dashboard/stats` | Returns core overview counts and conversion rates |
| `GET` | `/api/system/status` | Connectivity status of database, LinkedIn provider, and Gmail |
| `POST` | `/api/search/start` | Triggers LinkedIn search pipeline across target keywords |
| `GET` | `/api/search/history` | Audit log of previous keyword search operations |
| `GET` | `/api/posts` | Filter posts by keyword, `is_within_24h`, `is_us_based`, and text |
| `POST` | `/api/posts` | Manually inject and test a custom LinkedIn post |
| `GET` | `/api/recruiters` | Retrieve recruiters filtered by validation status or keyword |
| `GET` | `/api/recruiters/{id}` | Detailed recruiter record and validation report |
| `POST` | `/api/emails/generate` | Generate email drafts for eligible valid recruiters |
| `GET` | `/api/emails/pending` | Retrieve email drafts awaiting admin review |
| `GET` | `/api/emails/campaigns` | List email drafts filtered by lifecycle status |
| `PUT` | `/api/emails/{id}` | Edit subject, body, or recipient before sending |
| `POST` | `/api/emails/{id}/approve` | Administrator approves an email draft |
| `POST` | `/api/emails/{id}/send` | Send approved email via Gmail API / Simulation |
| `POST` | `/api/emails/{id}/reject` | Administrator rejects/cancels an email draft |
| `GET` | `/api/emails/history` | List of successfully transmitted emails |
| `GET` | `/api/emails/logs` | Immutable audit log of email system events |
| `GET` | `/api/settings` | Retrieve application configuration parameters |
| `PUT` | `/api/settings` | Update settings (keywords, frequency, sender profile) |

Interactive OpenAPI documentation is available live at `http://127.0.0.1:8000/docs`.

---

## 11. Interactive Admin Dashboard

The application features a single-page responsive dashboard accessible at `http://127.0.0.1:8000`:

- **Overview Tab**: Metric cards (Total Posts, 24h Posts, US Jobs, Recruiters, Valid Emails, Pending Review, Sent Emails), end-to-end visual pipeline stepper, recent search runs table, live delivery activity feed.
- **LinkedIn Posts Tab**: Keyword pill filters, toggle switches for "Last 24h Only" and "US Jobs Only", search input, full post cards with badges and original LinkedIn post links, and a modal to test custom posts.
- **Recruiters Tab**: Recruiter directory with email validation badges (`VALID` in green, `RISKY` in amber, `INVALID` in red) and single-click draft creation.
- **Email Campaigns Tab**: Sub-tabs for "Awaiting Approval", "Approved & Ready", and "Sent History". Includes a full **Review & Edit Modal** with live HTML preview before sending.
- **Settings Tab**: Configure background automation on/off, search frequency dropdown, keyword tag manager, sender company and personal details, and live email template preview iframe.
- **Audit Logs Tab**: Complete audit trail of system events.

---

## 12. Installation & Quick Start

### 1. Prerequisites
- Python 3.11 or higher
- Git

### 2. Clone and Setup Environment
```bash
# Clone the repository
git clone <repository_url>
cd api-c2c-automation

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default values work out of the box with the authorized mock provider and simulation mode enabled:
```ini
APP_ENV=development
APP_PORT=8000
APP_HOST=127.0.0.1
DATABASE_URL=sqlite:///./c2c_automation.db

LINKEDIN_USE_MOCK=true
GMAIL_USE_MOCK=true
GMAIL_SENDER_EMAIL=recruiter.bench.sales@gmail.com
```

### 4. Start the Application
Run the root launcher:
```bash
python run.py
```
Or use Uvicorn directly:
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 5. Access the Dashboard
Open your web browser and navigate to:
```
http://127.0.0.1:8000
```

---

## 13. Running Automated Tests

A comprehensive Pytest suite is provided covering post filtering, recruiter extraction, email validation, FastAPI endpoints, and the complete end-to-end workflow:

```bash
python -m pytest tests/ -v
```

### Test Suite Summary:
- **`tests/test_filtering.py`**: Validates 24-hour time filtering, US state/metro/remote recognition, non-US exclusions (UK, India), and keyword matching across all 6 target keywords.
- **`tests/test_recruiter_extraction.py`**: Validates name/signature parsing, email regex extraction, job type determination (C2C, W2, Full-Time), and email RFC/disposable checks.
- **`tests/test_api.py`**: Validates all FastAPI REST endpoints, status codes, query parameters, and configuration updates.
- **`tests/test_workflow.py`**: Executes and validates the complete 9-step pipeline:
  `Search Keywords → Retrieve Posts → Filter Last 24 Hours → Filter US Jobs → Extract Recruiter Details → Validate Emails → Generate Email Drafts → Admin Approval → Send Email`.

---

## 14. Production Deployment & Security

- **Database Scaling**: To use PostgreSQL or Supabase in production, update `DATABASE_URL` in `.env`:
  ```ini
  DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
  ```
- **Gmail OAuth 2.0 Setup**:
  1. Create a project in Google Cloud Console.
  2. Enable the **Gmail API**.
  3. Create OAuth 2.0 Web Application credentials.
  4. Set `GMAIL_USE_MOCK=false`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN` in `.env`.
- **Compliance Safeguards**:
  - The application strictly enforces the administrator approval requirement to prevent unsolicited bulk emailing.
  - Sensitive tokens and secrets are stored in environment variables and never logged or exposed to the frontend.

