# Hugging Face Semantic Similarity Setup Guide

This guide explains how to set up and use semantic similarity for diagnosis comparison.

## What is Semantic Similarity?

Semantic similarity uses AI to understand the **meaning** of diagnoses, not just their spelling or keywords. This catches cases where the same diagnosis is phrased differently:

- ✅ "Chest pain" matches "Acute chest pain"
- ✅ "MI" matches "Myocardial infarction"  
- ✅ "SOB" matches "Shortness of breath"
- ✅ "Pneumonia, bacterial" matches "Bacterial pneumonia"

We use Hugging Face's **sentence-transformers** (all-mpnet-base-v2) model, which is hosted and serverless.

---

## Setup Options

### Option 1: Hugging Face Inference API (Recommended - Easiest)

Perfect for production use. No local setup required.

**Step 1: Get HF API Token**
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access is sufficient)
3. Copy your token

**Step 2: Set Environment Variable**

For **Next.js**, add to `.env.local`:
```env
HF_TOKEN=hf_your_token_here_xxxxx
```

For **deployment** (Vercel, etc.), add to environment variables in your dashboard.

**Step 3: Initialize in Your App**

Option A - Server-side (API route):
```typescript
// app/api/initialize.ts
import { HFSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

export async function GET() {
  // Token is automatically picked up from process.env.HF_TOKEN
  return Response.json({ status: 'ready' });
}
```

Option B - Client-side (if you have token):
```typescript
import { HFSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

// Call once at app startup
HFSemanticSimilarity.setApiToken(process.env.NEXT_PUBLIC_HF_TOKEN || '');
```

**Step 4: Use Normally**
```typescript
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';

const evaluation = await DiagnosisEvaluationService.evaluateScenario(scenario, 250);
// Semantic similarity is now included in the score!
```

---

### Option 2: Local Transformers (For Offline Use)

If you want to run everything locally without API calls.

**Step 1: Install Dependencies**
```bash
npm install @xenova/transformers
```

**Step 2: Use LocalSemanticSimilarity**

In your code, import and initialize:
```typescript
import { LocalSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

// Call once at app startup (this downloads the model ~500MB)
await LocalSemanticSimilarity.initialize();

// Then use normally
const evaluation = await DiagnosisEvaluationService.evaluateScenario(scenario);
```

**Pros:**
- No API calls (privacy)
- Works offline
- No token needed

**Cons:**
- First run downloads ~500MB model
- Slower on CPU (use GPU if possible)
- Larger bundle size

---

### Option 3: Both (Automatic Fallback)

Use API normally, but have local fallback:

```typescript
import { HFSemanticSimilarity, LocalSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

// Try HF API first
try {
  const similarity = await HFSemanticSimilarity.compareSemantic(text1, text2);
} catch (error) {
  // Fallback to local
  await LocalSemanticSimilarity.initialize();
  const similarity = await LocalSemanticSimilarity.compareSemantic(text1, text2);
}
```

---

## Cost Analysis

### HF Inference API (Option 1)
- **Free tier**: 30,000 inference calls/month (plenty for most use cases)
- **Pro tier**: €9/month for higher limits
- **Pricing**: After free tier, ~$0.0001 per inference

For 222 scenarios:
- Single evaluation: ~1 API call per scenario = 222 calls
- First month: Free (under 30k)
- Subsequent months: <$0.03 if you don't exceed free tier

### Local (Option 2)
- **Cost**: FREE
- **Trade-off**: ~500MB model download, slower inference

---

## Performance

### Speed
- **HF API**: 200-500ms per diagnosis comparison (includes network latency)
- **Local**: 50-200ms per comparison (depends on hardware)

### Accuracy
Both use the same model (`all-mpnet-base-v2`), so accuracy is identical. HF is just hosted.

---

## Accuracy Calculation Now Includes

With semantic similarity enabled, your diagnosis accuracy score now includes:

```
Overall Score = 
  (30% × Exact Match) +
  (30% × Semantic Similarity) +    ← NEW!
  (20% × Levenshtein) +
  (20% × Keyword Match)
```

**Example:**
- "Chest pain" vs "Acute chest discomfort"
  - Exact Match: 0 (not identical)
  - Semantic: 0.92 (very similar meaning)
  - Levenshtein: 0.60 (some char differences)
  - Keyword: 0.75 (chest overlaps)
  - **Overall: 0.30(0) + 0.30(0.92) + 0.20(0.60) + 0.20(0.75) = 0.63 (63% accurate)**

---

## Testing It

### Test with Mock Data
```typescript
import { HFSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

// Set your token
HFSemanticSimilarity.setApiToken('hf_your_token');

// Test semantic similarity
const similarity = await HFSemanticSimilarity.compareSemantic(
  'Chest pain',
  'Acute chest discomfort'
);
console.log('Semantic similarity:', similarity); // Should be ~0.90+
```

### Check Embedding Cache
```typescript
import { HFSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

const stats = HFSemanticSimilarity.getCacheStats();
console.log('Cached embeddings:', stats.size);
console.log('Cache entries:', stats.entries);

// Clear cache if needed
HFSemanticSimilarity.clearCache();
```

---

## Troubleshooting

### Error: "HF_TOKEN not set"
- **Cause**: Environment variable not set
- **Fix**: Add `HF_TOKEN=your_token` to `.env.local`

### Error: "401 Unauthorized"
- **Cause**: Invalid token
- **Fix**: Check token on https://huggingface.co/settings/tokens

### Error: "Model is currently loading"
- **Cause**: First request to HF (loading model)
- **Fix**: Wait 1-2 minutes, retry

### Slow Responses
- **For HF API**: Network latency (200-500ms is normal)
- **For Local**: CPU bottleneck. Use GPU if possible.

### Embeddings Not Being Cached
- **Check cache**: `HFSemanticSimilarity.getCacheStats()`
- **Clear cache**: `HFSemanticSimilarity.clearCache()`
- **Cache TTL**: 24 hours

---

## Examples

### Full Batch Evaluation with Semantic Similarity
```typescript
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';
import { HFSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

// Initialize
HFSemanticSimilarity.setApiToken(process.env.HF_TOKEN || '');

// Evaluate all scenarios (async)
const evaluations = await Promise.all(
  scenarios.map(s => DiagnosisEvaluationService.evaluateScenario(s))
);

// Generate report (includes semantic similarity in scores)
const report = DiagnosisEvaluationService.generateReportSummary(evaluations);

console.log('Diagnosis accuracy (with semantic):', report.diagnosisAccuracy.overallScore.average);
```

### API Endpoint with Semantic Similarity
```typescript
// app/api/research/evaluate.ts
import { DiagnosisEvaluationService } from '@/lib/evaluation/evaluation-service';
import { ResearchDataExporter } from '@/lib/evaluation/research-exporter';
import { HFSemanticSimilarity } from '@/lib/evaluation/hf-semantic';

export async function POST(request: Request) {
  const { scenarioIds } = await request.json();

  // Initialize HF (token from env)
  // Token is automatically used from process.env.HF_TOKEN

  // Fetch scenarios
  const scenarios = await db.scenarios.findMany({
    where: { id: { in: scenarioIds } }
  });

  // Evaluate with semantic similarity
  const evaluations = await Promise.all(
    scenarios.map(s => 
      DiagnosisEvaluationService.evaluateScenario(s)
    )
  );

  // Generate report
  const report = DiagnosisEvaluationService.generateReportSummary(evaluations);

  // Export
  return Response.json({
    report,
    markdown: ResearchDataExporter.generateMarkdownReport(report),
    csv: ResearchDataExporter.exportRecordsToCSV(evaluations),
  });
}
```

---

## What the Model Understands

The all-mpnet-base-v2 model was trained on medical and general text, so it understands:

✅ Medical terminology
✅ Abbreviations (MI = Myocardial infarction)
✅ Synonyms (chest pain = chest discomfort)
✅ Different word orders
✅ Minor phrasing differences

❌ Cannot understand:
- Completely unrelated diagnoses (chest pain vs broken arm)
- Completely misspelled words (pneumonia vs pneumoa)

---

## Monitoring & Debugging

### Log Semantic Similarity Scores
```typescript
import { compareDiagnoses } from '@/lib/evaluation/diagnosis-evaluator';

const metrics = await compareDiagnoses('Chest pain', 'Acute chest discomfort', 0.88);

console.log('Semantic similarity:', metrics.semanticSimilarity); // 0-1 score
console.log('Levenshtein:', metrics.levenshteinSimilarity);
console.log('Keyword:', metrics.keywordMatch);
```

### Export Semantic Scores in CSV
The CSV export now includes semantic similarity in the detailed records. Open `evaluation-details.csv` to see:
- ScenarioId
- DiagnosisExactMatch
- DiagnosisSemanticSimilarity ← NEW
- DiagnosisLevenshteinSimilarity
- DiagnosisOverallScore

---

## Next Steps

1. **Get HF token**: https://huggingface.co/settings/tokens
2. **Set env variable**: Add to `.env.local`
3. **Test**: Run one evaluation
4. **Deploy**: Add token to production environment
5. **Monitor**: Check cache stats and API usage

That's it! Semantic similarity will now be included in all diagnosis evaluations. 🚀
