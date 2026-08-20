# MedGemma Triage: CDSS Evaluation Platform 🩺🚑

A specialized web-based testing ground designed for clinical experts to evaluate and grade **MedGemma**—Google’s medical-tuned LLM—on its ability to perform emergency room triage.

This platform bridges the gap between raw AI inference and clinical safety by collecting high-quality, human-in-the-loop validation data from licensed Doctors and Nurses.

---

## 🚀 Overview

In an Emergency Department (ED), every second counts. This application allows clinicians to review simulated (or historical de-identified) emergency scenarios and critique the AI's response across four critical dimensions:

1.  **Triage Level:** Accuracy of the ESI (Emergency Severity Index) or equivalent.
2.  **Diagnosis:** Precision of the primary differential diagnosis.
3.  **Treatment Plan:** Practicality and safety of suggested immediate interventions.
4.  **Reasoning & Confidence:** Evaluation of the "Chain-of-Thought" and self-reported confidence metrics.

---

## 🛠 Tech Stack

The architecture is designed for speed, security, and high-fidelity AI inference:

* **Frontend:** [Next.js](https://nextjs.org/) (Hosted on **Vercel**)
* **AI Model:** [MedGemma](https://huggingface.co/google/medgemma-1.5-27b-it) (Hosted on **Google Cloud / Vertex AI**)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL & User Management)
* **Styling:** Tailwind CSS

---

## 🧠 Evaluation Framework

For every scenario, MedGemma generates a structured response. Clinicians then provide a "Ground Truth" grade based on the following:

| Output Feature | Description | Evaluation Metric |
| :--- | :--- | :--- |
| **Triage Level** | Categorization of urgency (1-5). | Likert Scale (1-5) |
| **Diagnosis** | Clinical prediction of the underlying issue. | Binary (Correct/Incorrect) |
| **Treatment** | Recommended immediate medical actions. | Safety/Efficacy Rating |
| **Confidence** | AI's self-assessment of its own accuracy. | Calibration Score |
| **Reasoning** | The logical steps taken to reach the decision. | Qualitative Feedback |

---

## ⚙️ Project Structure & Setup

### Environment Variables
To run this project, you will need to add the following variables to your `.env.development` & `env.production` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# HuggingFace API (for MedGemma inference)
HF_API_KEY=your_huggingface_api_key

# Cloudflare Turnstile (CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Next
NEXT_PUBLIC_SITE_URL=public_facing_website_url or localhost_url
```

---

## 🖥️ Development Setup

### Prerequisites
- **Node.js:** v18 or later
- **npm** or **yarn** or **pnpm** package manager
- **Git:** for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dorianbucknor/triage-assist-auditor
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   Or with yarn:
   ```bash
   yarn install
   ```
   
   Or with pnpm:
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy the environment variables template above
   - Create a `.env.development` file in the project root
   - Fill in all required credentials and API keys

4. **Initialize Supabase (if needed):**
   ```bash
   # Ensure your Supabase project is set up with the required tables
   # Check the supabase/ directory for migration files
   ```

### Running the Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

**Key features:**
- Fast refresh on file changes
- Error overlay for debugging
- API routes available at `http://localhost:3000/api/*`

---

## 🔨 Building for Production

### Build Command

Create an optimized production build:

```bash
npm run build
```

This will:
- Compile TypeScript and JSX
- Optimize assets and images
- Generate a `.next` directory with the production build
- Run linting checks

### Starting the Production Server

After building, start the production server:

```bash
npm start
```

The application will be available at `http://localhost:3000` (production mode).

---

## 📋 Available Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint code quality checks |
| `npm test` | Run Jest test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

---


## 🏗️ Project Architecture

### Key Directories

```
app/                    # Next.js app router and pages
├── api/                # API routes for backend logic
├── admin/              # Admin dashboard pages
├── app/                # User application pages
└── auth/               # Authentication pages

components/            # React components
├── ui/                 # Reusable UI components
├── app/                # Application-specific components
└── admin-dashboard/    # Admin dashboard components

lib/                   # Utility functions and types
├── types.ts            # TypeScript type definitions
├── utils.ts            # Helper utilities
└── dal.ts              # Data access layer

providers/             # Context providers and external clients
├── supabase/           # Supabase client setup
├── huggingface/        # HF inference client
├── tanstack/           # React Query wrapper
├── jotai/              # State management setup
└── theme/              # Theme provider

hooks/                 # Custom React hooks
public/                # Static assets
supabase/              # Supabase migrations and config
```

---

## 🔐 Security Considerations

1. **Environment Variables:** Never commit `.env.local` to version control
2. **API Keys:** Keep all API keys secure; use server-side environment variables
3. **CORS:** Configure appropriately for Supabase and AI model endpoints
4. **Authentication:** Leverage Supabase for secure user management
5. **CAPTCHA:** Turnstile integration protects forms from abuse

---

## 🚢 Deployment

### Recommended Platforms

- **Frontend:** [Vercel](https://vercel.com/) (optimized for Next.js)
- **Database:** [Supabase Cloud](https://supabase.com/pricing)
- **AI Inference:** [Vertex AI](https://cloud.google.com/vertex-ai) or [HuggingFace Inference API](https://huggingface.co/inference-api)

### Deployment Steps (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (automatic on main branch push)

---

## 📚 Key Dependencies

| Package | Purpose |
| :--- | :--- |
| [Next.js](https://nextjs.org/) | React framework with file-based routing |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | Database & auth client |
| [React Hook Form](https://react-hook-form.com/) | Form state management |
| [React Query](https://tanstack.com/query) | Server state management |
| [HuggingFace JS](https://github.com/huggingface/huggingface.js) | AI model inference |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |
| [Lucide React](https://lucide.dev/) | Icon library |

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes and commit with clear messages
3. Ensure tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Submit a pull request for review

---

## 📄 License

[Add your license here]

---

## 📧 Support & Questions

For questions or issues:
- Create an issue in the GitHub repository
- Contact the development team
- Review documentation in the docs/ directory

---

**Last Updated:** May 2026
