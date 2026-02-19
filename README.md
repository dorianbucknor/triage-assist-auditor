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
To run this project, you will need to add the following variables to your `.env.local` file:
