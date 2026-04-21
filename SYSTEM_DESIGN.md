# TriageAssist - System Design & Prototype Development

## Platform Overview
**TriageAssist** is an AI-powered healthcare triage platform enabling clinicians to assess patient conditions, generate medical recommendations, and manage triage workflows through an intuitive web interface.

---

## Technology Stack

### Frontend Layer
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui component library
- **Authentication**: Supabase Auth (sign-in/sign-up flows)
- **State Management**: React hooks (local state)
- **Notifications**: Sonner (toast/notification system)
- **Theme**: next-themes (light/dark mode support)

### Backend & Data Layer
- **Database**: Supabase (PostgreSQL-based)
- **Auth Provider**: Supabase Authentication
- **API Layer**: Next.js API routes (`/app/api`)
- **Real-time Sync**: Supabase Realtime (ready for integration)

### AI & Medical Systems
- **Medical AI**: MedGemma (lightweight medical LLM)
- **AI Inference**: Custom API endpoints for medical decision support
- **NLP Processing**: Patient symptom analysis & triage classification
- **Clinical Decision Support**: Evidence-based recommendation engine

### Infrastructure & DevOps
- **Hosting**: Deployment-ready (Azure/Vercel compatible)
- **Version Control**: Git-based workflow
- **Build System**: Next.js build optimization
- **Environment Config**: Supabase configuration files

---

## System Architecture

### Core Components
1. **Auth Module** (`/app/auth/`)
   - User sign-in/sign-up flows
   - Supabase session management

2. **Admin Dashboard** (`/app/admin/`)
   - Clinician metrics overview
   - User management CRUD
   - Role-based access control (RBAC) ready

3. **Triage Engine** (`/app/app/`)
   - Patient intake & symptom collection
   - AI-powered triage classification
   - MedGemma medical reasoning

4. **User Metrics** (`/app/admin/user-metrics/`)
   - Clinician activity tracking
   - Triage statistics & performance analytics

5. **UI Component System** (`/components/ui/`)
   - Accessible Radix primitives (Card, Dialog, Sheet, Table, etc.)
   - Form validation & input handling
   - Responsive layout patterns

---

## Development Phases

### Phase 1: Prototype Foundation ✅
- User authentication (Supabase Auth)
- Admin dashboard with user management
- Multi-theme support (light/dark)
- Core UI component library

### Phase 2: Triage Workflows (In Progress)
- Patient data capture forms
- Symptom input & validation
- MedGemma integration for medical AI
- Clinical decision support output

### Phase 3: Analytics & Clinical Integration (Planned)
- Real-time metrics dashboard
- Triage outcome tracking
- Integration with hospital EHR systems
- Audit logging & compliance (HIPAA-ready structure)

---

## Key Features

| Feature | Status | Technology |
|---------|--------|-----------|
| User Auth | ✅ Complete | Supabase Auth |
| Admin Dashboard | ✅ Complete | Next.js + React |
| User Management | ✅ Complete | Supabase DB |
| Triage Interface | 🔄 In Progress | Next.js + AI |
| Medical AI Engine | 🔄 Planning | MedGemma |
| Real-time Sync | ⏳ Ready | Supabase Realtime |
| Analytics | ⏳ Planned | Supabase Analytics |
| HIPAA Compliance | ⏳ Roadmap | Encryption + Audit |

---

## Data Flow

```
Patient Input → Symptom Parser → MedGemma Classification → 
Clinical Recommendation → Clinician Review → Outcome Tracking → 
Metrics & Analytics
```

---

## Security & Compliance
- **Auth**: Row-Level Security (RLS) via Supabase
- **Encryption**: TLS/SSL for data in transit
- **Data Handling**: HIPAA-compliant structure (PII isolation)
- **Access Control**: Role-based permissions (admin/clinician/patient)

---

## Deployment Pipeline
- **Build**: `npm run build` (optimized Next.js production bundle)
- **Testing**: TypeScript type checking + component tests (manual)
- **Environment**: `.env.local` configuration for Supabase
- **Hosting**: Ready for Vercel, Azure, or self-hosted deployment

---

## Developer Workflow
1. Clone repo & configure Supabase connection
2. `npm install` → install dependencies
3. `npm run dev` → start dev server (localhost:3000)
4. Build components in `/components`, routes in `/app`
5. Push to `main` → automatic deployment pipeline

---

## Next Steps
- [ ] Integrate MedGemma medical LLM
- [ ] Build patient intake form workflows
- [ ] Implement real-time triage analytics
- [ ] Connect hospital EHR integration APIs
- [ ] HIPAA compliance audit & certification
