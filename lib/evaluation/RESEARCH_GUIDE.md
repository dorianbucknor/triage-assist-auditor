# TriageAssist AI Diagnosis Evaluation - Implementation Guide

## Overview

You now have a complete evaluation framework to assess how accurately your AI diagnoses match the MIMIC-IV dataset ground truth. This document maps your questions to the solution.

---

## Question 1: How and what tools can I use to check AI diagnosis accuracy?

### ✅ Tools Implemented

#### 1. **String Similarity Metrics** (Already Built)
```typescript
// In lib/evaluation/diagnosis-evaluator.ts

// Levenshtein Distance - catches typos and minor variations
calculateLevenshteinSimilarity(aiDiagnosis, groundTruth)
// Returns: 0-1 (1 = identical)

// Keyword Matching - checks if key medical terms match
calculateKeywordSimilarity(aiDiagnosis, groundTruth)
// Returns: 0-1 (Jaccard similarity of keywords)

// Exact Match - binary comparison
comparesDiagnoses(groundTruth, aiDiagnosis)
// Returns: { exactMatch: boolean, score: number }
```

#### 2. **Weighted Accuracy Score**
All three metrics are combined into one overall score:
```
Overall Score = (40% × Exact Match) + (30% × Levenshtein) + (30% × Keyword)
Range: 0-1 (higher is better)
```

#### 3. **Triage Level Comparison**
```typescript
compareTriageLevels(groundTruthLevel, predictedLevel)
// Returns: { match: boolean, distance: 0-4, accuracy: 'exact'|'close'|'far' }
```

#### 4. **Performance Metrics**
- Response time (in milliseconds)
- Response speed category (fast < 100ms, normal 100-1000ms, slow > 1000ms)
- AI confidence score (0-1)

### How to Use These Tools

**Basic example:**
```typescript
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';

const evaluation = DiagnosisEvaluationService.evaluateScenario(
  scenario,
  responseTimeMs
);

console.log(evaluation.metrics);
// {
//   diagnosisExactMatch: false,
//   diagnosisOverallScore: 0.78,        // AI diagnosis is 78% accurate
//   triageLevelMatch: true,              // ESI level matches
//   triageLevelDistance: 0,              // Perfect match
//   responseTimeMs: 245,
//   processingSpeedCategory: 'normal',
//   aiConfidence: 0.88
// }
```

---

## Question 2: How should I incorporate evaluation of diagnosis, triage, and speed into one document for research?

### ✅ Document Structure Created

I've created a comprehensive **`DiagnosisEvaluationRecord`** that ties everything together:

```typescript
{
  scenarioId: "scenario-123",      // Link to dataset scenario
  subjectId: "10000032",           // Patient ID
  
  // GROUND TRUTH (from your MIMIC-IV dataset)
  groundTruth: {
    chiefComplaint: "Chest pain",
    acuity: "ESI-2",               // If available
    triageDuration: 7200,          // seconds (arrival to triage)
    // ... vitals, demographics, etc.
  },
  
  // AI PREDICTION
  aiPrediction: {
    diagnosis: "Acute coronary syndrome",
    triageLevel: "2",
    confidence: 0.88
  },
  
  // INTEGRATED METRICS
  metrics: {
    // Diagnosis accuracy
    diagnosisExactMatch: false,
    diagnosisOverallScore: 0.78,    // 0-1
    
    // Triage accuracy
    triageLevelMatch: true,
    triageLevelDistance: 0,         // 0-4
    
    // Performance
    responseTimeMs: 245,
    processingSpeedCategory: "normal",
    
    // Confidence calibration
    aiConfidence: 0.88,
    clinicalSignificance: "high"    // high|medium|low
  },
  
  // Research metadata
  research: {
    evaluationDate: "2024-01-15T10:30:00Z",
    evaluationType: "automated",
    includeInStudy: true
  }
}
```

### ✅ Research Report Document

The framework automatically generates a **`ResearchReportSummary`** with:

#### Summary Statistics Section:
```typescript
{
  totalScenariosEvaluated: 222,
  totalScenariosIncluded: 215,
  
  diagnosisAccuracy: {
    exactMatch: { count: 142, percentage: 65.1% },
    averageScore: 0.78,
    medianScore: 0.81,
    standardDeviation: 0.15
  },
  
  triageAccuracy: {
    exactMatch: { count: 189, percentage: 87.9% },
    withinOneLevel: { count: 210, percentage: 97.7% }
  },
  
  performanceMetrics: {
    averageResponseTime: 342,
    medianResponseTime: 285,
    minResponseTime: 50,
    maxResponseTime: 2150,
    fastResponses: 45,
    normalResponses: 168,
    slowResponses: 2
  }
}
```

#### Analysis Section:
```typescript
{
  topAccurateDiagnoses: [
    { diagnosis: "Chest pain", count: 28, accuracy: 0.89 },
    { diagnosis: "Shortness of breath", count: 24, accuracy: 0.84 }
  ],
  
  commonMisdiagnoses: [
    { actual: "Chest pain", predicted: "GERD", frequency: 5 },
    { actual: "Abdominal pain", predicted: "Gastroenteritis", frequency: 4 }
  ],
  
  difficultCases: [
    { scenarioId: "123", accuracyScore: 0.35, reason: "Triage mismatch" }
  ],
  
  triageLevelCorrelation: 0.72  // How diagnosis accuracy correlates with triage
}
```

---

## Export Formats for Research

### Format 1: **Markdown Report** (For Papers/Presentations)
```typescript
const markdown = ResearchDataExporter.generateMarkdownReport(report);
// Generates: professional markdown with tables, statistics, findings
```

**Output includes:**
- Executive summary
- Diagnosis accuracy tables
- Triage accuracy breakdown
- Performance benchmarks
- Key findings
- Recommendations

**Example output:**
```markdown
# TriageAssist AI Diagnosis Evaluation Report

## Executive Summary
- Total Scenarios Evaluated: 222
- Diagnosis Accuracy: 78% ± 0.15
- Triage Accuracy: 88%
- Avg Response Time: 342ms

## Diagnosis Accuracy
| Metric | Value |
|--------|-------|
| Exact Match | 142/215 (65.1%) |
| Average Score | 0.78 |
| Std Deviation | 0.15 |

[... more tables and analysis ...]
```

### Format 2: **CSV with All Records** (For Excel/Statistical Analysis)
```typescript
const csv = ResearchDataExporter.exportRecordsToCSV(evaluations);
// Generates: CSV with one row per scenario
```

**Columns:**
- ScenarioId, SubjectId, ChiefComplaint
- GroundTruthAcuity, AIPredictedDiagnosis
- DiagnosisExactMatch, DiagnosisOverallScore
- TriageLevelMatch, TriageLevelDistance
- ResponseTimeMs, AIConfidence
- ClinicalSignificance, EvaluationDate

### Format 3: **JSON for Data Analysis** (For R/Python/Tableau)
```typescript
const json = ResearchDataExporter.exportToJSONString(report, records);
// Generates: Structured JSON with both summary and detailed records
```

---

## Implementation Steps

### Step 1: Install Dependencies (Optional)
```bash
npm install js-levenshtein
# Already included in diagnosis-evaluator.ts
```

### Step 2: Create API Endpoint for Batch Evaluation
```typescript
// app/api/research/evaluate.ts
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';
import { ResearchDataExporter } from '@/lib/evaluation/research-exporter';

export async function POST(request: Request) {
  const { scenarioIds } = await request.json();
  
  // Fetch scenarios from your database
  const scenarios = await fetchScenarios(scenarioIds);
  
  // Evaluate all
  const evaluations = scenarios.map(s => 
    DiagnosisEvaluationService.evaluateScenario(s)
  );
  
  // Generate report
  const report = DiagnosisEvaluationService.generateReportSummary(
    evaluations
  );
  
  // Export formats
  return Response.json({
    report,
    markdown: ResearchDataExporter.generateMarkdownReport(report),
    csv: ResearchDataExporter.exportRecordsToCSV(evaluations),
    json: ResearchDataExporter.exportToJSON(report, evaluations)
  });
}
```

### Step 3: Display Metrics in UI
```typescript
// Add to your scenario page
<div className="evaluation-metrics">
  <h3>AI Evaluation Metrics</h3>
  <div>Diagnosis Accuracy: {(metrics.diagnosisOverallScore * 100).toFixed(1)}%</div>
  <div>Triage Match: {metrics.triageLevelMatch ? '✓' : '✗'}</div>
  <div>Response Time: {metrics.responseTimeMs}ms</div>
  <div>AI Confidence: {(metrics.aiConfidence * 100).toFixed(1)}%</div>
</div>
```

### Step 4: Generate and Download Report
```typescript
async function generateReport() {
  const response = await fetch('/api/research/evaluate', {
    method: 'POST',
    body: JSON.stringify({ scenarioIds: allScenarioIds })
  });
  
  const { markdown, csv, json } = await response.json();
  
  // Download markdown for paper
  downloadFile(markdown, 'evaluation-report.md', 'text/markdown');
  
  // Download CSV for analysis
  downloadFile(csv, 'evaluation-details.csv', 'text/csv');
  
  // Download JSON for further processing
  downloadFile(JSON.stringify(json), 'evaluation-data.json', 'application/json');
}
```

---

## Key Metrics Summary

### For Your Research Presentation:

| Component | Metric | Purpose |
|-----------|--------|---------|
| **Diagnosis** | Overall Score (0-1) | How accurate is the AI diagnosis? |
| **Diagnosis** | Exact Match % | Percentage of perfect matches |
| **Diagnosis** | Keyword Match | Are key medical terms captured? |
| **Triage** | ESI Level Match % | How often does triage match exactly? |
| **Triage** | Within One Level % | How close are off-by-one cases? |
| **Performance** | Response Time (ms) | How fast is the AI? |
| **Performance** | Speed Category | Fast/Normal/Slow classification |
| **Confidence** | AI Confidence (0-1) | How sure is the AI system? |
| **Confidence** | Clinical Significance | Is it high/medium/low importance? |

---

## Example Research Report Table

Here's how to present your findings:

```
TriageAssist AI Diagnosis Evaluation (n=215 scenarios)

Diagnosis Accuracy:
├─ Exact Match: 142/215 (65.1%)
├─ Average Score: 0.78 ± 0.15
├─ >80% Accurate: 123 scenarios (57%)
└─ >60% Accurate: 185 scenarios (86%)

Triage Accuracy:
├─ Exact Match: 189/215 (87.9%)
├─ Within One Level: 210/215 (97.7%)
├─ Off by 2+ Levels: 5/215 (2.3%)
└─ Mean Distance: 0.23 levels

Performance:
├─ Mean Response Time: 342 ms
├─ Median Response Time: 285 ms
├─ Fast Responses (<100ms): 45 (20.9%)
└─ Normal Responses: 168 (78.1%)

AI Confidence:
├─ High Confidence (≥0.7): 178 scenarios
├─ Average Accuracy (High): 0.84
├─ Low Confidence (<0.4): 12 scenarios
└─ Average Accuracy (Low): 0.52
```

---

## Files Created

```
lib/evaluation/
├── diagnosis-evaluator.ts          # String similarity & comparison tools
├── types.ts                         # Type definitions
├── evaluation-service.ts            # Main evaluation engine
├── research-exporter.ts             # Export to CSV/JSON/Markdown
└── README.md                        # Usage guide
__tests__/lib/
└── evaluation.test.ts               # Test examples
```

---

## Next: Integrate with Your Dataset

To start using this with your MIMIC-IV data:

1. Make sure `scenario.triageData` contains the chief complaint
2. Make sure `scenario.triageData.otherLabs.acuity` contains the ESI level
3. Call `DiagnosisEvaluationService.evaluateScenario(scenario)` for each scenario
4. Generate report with `DiagnosisEvaluationService.generateReportSummary(records)`
5. Export in your desired format

Your research presentation now has:
✅ Quantified diagnosis accuracy  
✅ Triage level accuracy metrics  
✅ Response speed benchmarks  
✅ Professional research report format  
✅ Exportable data for statistical analysis  
