# AI Diagnosis Evaluation Framework

This framework provides tools to evaluate the accuracy of AI diagnoses against ground truth data from your MIMIC-IV dataset.

## Quick Start

### 1. Evaluate a Single Scenario

```typescript
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';
import type { Scenario } from '@/lib/types';

// Evaluate one scenario
const evaluation = DiagnosisEvaluationService.evaluateScenario(
  scenario,
  responseTimeMs, // optional: time it took for AI to generate response
  evaluatorId // optional: if manual evaluation
);
```

### 2. Generate a Full Research Report

```typescript
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';
import { ResearchDataExporter } from '@/lib/evaluation/research-exporter';

// You have an array of evaluated scenarios
const records: DiagnosisEvaluationRecord[] = scenarios.map(s => 
  DiagnosisEvaluationService.evaluateScenario(s)
);

// Generate research report
const report = DiagnosisEvaluationService.generateReportSummary(
  records,
  'TriageAssist'
);

// Export in different formats
const csvExport = ResearchDataExporter.exportReportToCSV(report);
const markdownReport = ResearchDataExporter.generateMarkdownReport(report);
const jsonData = ResearchDataExporter.exportToJSONString(report, records);
```

### 3. Export for Research Presentation

```typescript
// Generate markdown for paper/presentation
const markdown = ResearchDataExporter.generateMarkdownReport(report);

// Export detailed CSV with all records
const detailedCSV = ResearchDataExporter.exportRecordsToCSV(records);

// Export as JSON for further analysis
const jsonReport = ResearchDataExporter.exportToJSON(report, records);
```

## Evaluation Metrics

### Diagnosis Accuracy

| Metric | Description | Range |
|--------|-------------|-------|
| **Exact Match** | Diagnosis is identical to ground truth | 0-1 |
| **Levenshtein Similarity** | String similarity accounting for typos/variations | 0-1 |
| **Keyword Match** | Percentage of key medical terms that match | 0-1 |
| **Overall Score** | Weighted combination (40% exact, 30% Levenshtein, 30% keyword) | 0-1 |

### Triage Accuracy

| Metric | Description |
|--------|-------------|
| **Exact Match** | ESI level matches ground truth exactly |
| **Within One Level** | ESI level is off by ≤1 level |
| **Distance** | How many levels off from ground truth |

### Performance

| Metric | Description |
|--------|-------------|
| **Response Time** | Time in milliseconds for AI to generate response |
| **Speed Category** | Fast (<100ms), Normal (100-1000ms), Slow (>1000ms) |

### Confidence Analysis

| Metric | Description |
|--------|-------------|
| **AI Confidence** | AI system's stated confidence (0-1) |
| **Clinical Significance** | High/Medium/Low based on diagnosis and triage accuracy |

## Data Structure

### DiagnosisEvaluationRecord

```typescript
{
  scenarioId: string;        // Unique scenario ID
  subjectId: string;         // Patient ID from dataset
  
  groundTruth: {
    chiefComplaint: string;  // From dataset
    acuity: string;          // ESI level or severity
    triageDuration: number;  // Seconds from arrival to triage
    // ... other vitals and demographics
  };
  
  aiPrediction: {
    diagnosis: string;
    triageLevel: string;
    confidence: number;       // 0-1
  };
  
  metrics: {
    diagnosisExactMatch: boolean;
    diagnosisOverallScore: number;    // 0-1
    triageLevelMatch: boolean;
    responseTimeMs: number;
    // ... more metrics
  };
  
  research: {
    evaluationDate: Date;
    evaluationType: 'automated' | 'manual' | 'hybrid';
    includeInStudy: boolean;
  };
}
```

### ResearchReportSummary

```typescript
{
  reportId: string;
  projectName: string;
  generatedAt: Date;
  
  summary: {
    diagnosisAccuracy: {
      exactMatch: { count: number; percentage: number };
      averageSimilarity: number;
      // ...
    };
    triageAccuracy: {
      exactMatch: { count: number; percentage: number };
      withinOneLevel: { count: number; percentage: number };
    };
    performanceMetrics: {
      averageResponseTime: number;
      // ...
    };
  };
  
  analysis: {
    topAccurateDiagnoses: Array<{ diagnosis: string; accuracy: number }>;
    commonMisdiagnoses: Array<{ actual: string; predicted: string; frequency: number }>;
    difficultCases: Array<{ scenarioId: string; accuracyScore: number }>;
  };
  
  recommendations: {
    strengths: string[];
    areasForImprovement: string[];
  };
}
```

## Tools Recommended for Diagnosis Comparison

### String Similarity
- **Levenshtein Distance**: Handles typos and minor variations
  ```bash
  npm install js-levenshtein
  ```

### Advanced (Optional)
- **Semantic Similarity** (replacing keyword matching):
  ```bash
  npm install natural @xenova/transformers
  ```

- **ICD-10 Coding** (standardize diagnoses):
  - Use medical ontologies or lookup services
  - Map diagnoses to standardized codes before comparison

## Usage Example: Batch Evaluation

```typescript
// API route: app/api/evaluation/batch.ts
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';
import { ResearchDataExporter } from '@/lib/evaluation/research-exporter';

export async function POST(request: Request) {
  const { scenarioIds } = await request.json();
  
  // Fetch scenarios from database
  const scenarios = await db.scenarios.findMany({
    where: { id: { in: scenarioIds } }
  });
  
  // Evaluate each scenario
  const evaluations = scenarios.map(s => 
    DiagnosisEvaluationService.evaluateScenario(s)
  );
  
  // Generate report
  const report = DiagnosisEvaluationService.generateReportSummary(
    evaluations,
    'TriageAssist'
  );
  
  // Export
  const markdown = ResearchDataExporter.generateMarkdownReport(report);
  const csv = ResearchDataExporter.exportRecordsToCSV(evaluations);
  
  return Response.json({
    report,
    markdownReport: markdown,
    csvExport: csv,
  });
}
```

## Integration with Existing Code

### In your Scenario Page
```typescript
// app/app/page.tsx
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';

export default function App() {
  // After AI generates response
  const evaluation = DiagnosisEvaluationService.evaluateScenario(
    scenario,
    responseTimeMs
  );
  
  // Display metrics to clinician
  return (
    <div>
      <ResponseCard aiResponse={scenario.aiResponse} />
      <EvaluationMetricsCard metrics={evaluation.metrics} />
    </div>
  );
}
```

### Add to Grading Section
```typescript
// components/app/clinician-grading-section.tsx
const evaluation = DiagnosisEvaluationService.evaluateScenario(scenario);

// Show AI accuracy before clinician grades
<div className="ai-metrics">
  <p>AI Diagnosis Match: {(evaluation.metrics.diagnosisOverallScore * 100).toFixed(1)}%</p>
  <p>AI Triage Match: {evaluation.metrics.triageLevelMatch ? '✓' : '✗'}</p>
  <p>Response Speed: {evaluation.metrics.processingSpeedCategory}</p>
</div>
```

## Research Report Output

The evaluation framework generates reports with:

1. **Summary Statistics**
   - Overall accuracy percentages
   - Confidence intervals
   - Performance benchmarks

2. **Detailed Analysis**
   - Most accurate diagnosis predictions
   - Common misdiagnosis patterns
   - Difficult cases

3. **Export Formats**
   - **CSV**: For Excel analysis
   - **JSON**: For programmatic access
   - **Markdown**: For papers and presentations

## Next Steps

1. **Integrate with your scenario storage**: Modify `evaluateScenario()` to work with your database
2. **Add semantic comparison**: Implement embedding-based diagnosis similarity
3. **Create dashboard**: Build UI to view reports
4. **Export automation**: Create API endpoint for batch exports
5. **Clinician feedback**: Collect manual gradings for validation

## Questions?

Key metrics for your research:
- ✅ **Diagnosis Accuracy**: Overall, exact match, partial match
- ✅ **Triage Level Accuracy**: ESI level matching
- ✅ **Response Speed**: Performance benchmarks
- ✅ **Confidence Calibration**: Does AI confidence correlate with accuracy?
- ✅ **Clinical Significance**: Is accuracy high on critical cases?
