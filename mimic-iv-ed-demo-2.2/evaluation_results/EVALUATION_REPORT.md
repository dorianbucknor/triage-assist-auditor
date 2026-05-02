# TriageAssist AI Diagnosis Evaluation Report

**Report ID:** report-1776808736128
**Generated:** 4/21/2026
**Project:** MIMIC-IV ED Triage AI Evaluation

## Executive Summary

- **Total Scenarios Evaluated:** 212
- **Scenarios Included in Analysis:** 212
- **Scenarios Excluded:** 0
- **Evaluation Period:** 4/21/2026 to 4/21/2026

## Diagnosis Accuracy

### Overview
| Metric | Value |
|--------|-------|
| Exact Match | 56/212 (26.4%) |
| Avg Keyword Match | 0.503 |
| Avg Levenshtein Similarity | 0.551 |
| Overall Accuracy Score | 0.496 ± 0.332 |

### Diagnosis Accuracy Distribution
- **>80% Accurate:** 29.7%
- **>60% Accurate:** 39.6%

## Triage Level Accuracy

| Metric | Value |
|--------|-------|
| Exact Match | 93/212 (43.9%) |
| Within One Level | 190/212 (89.6%) |

### Triage Distribution
- **Exact Match:** 93
- **Off by 1 Level:** 97
- **Off by 2 Levels:** 16
- **Off by 3+ Levels:** 6

## Performance Metrics

| Metric | Value |
|--------|-------|
| Average Response Time | 4568.36 ms |
| Median Response Time | 4426.50 ms |
| Min Response Time | 2653.00 ms |
| Max Response Time | 7009.00 ms |

### Response Speed Distribution
- **Fast (<100ms):** 0
- **Normal (100-1000ms):** 0
- **Slow (>1000ms):** 212

## AI Confidence Analysis

| Confidence Level | Count | Avg Accuracy |
|------------------|-------|---------------|
| High (≥0.7) | 199 | 0.478 |
| Medium (0.4-0.7) | 8 | 0.478 |
| Low (<0.4) | 5 | 0.424 |

## Top Accurate Diagnoses

| Diagnosis | Count | Accuracy |
|-----------|-------|----------|
| Assault | 1 | 100.0% |
| Elevated INR | 1 | 100.0% |
| Altered mental status | 4 | 100.0% |
| Rectal pain | 1 | 100.0% |
| Hematuria | 1 | 100.0% |
| Toe pain | 1 | 100.0% |
| Fever | 1 | 100.0% |
| Foot laceration | 1 | 100.0% |
| Head Bleed | 3 | 100.0% |
| Confusion | 1 | 100.0% |

## Common Misdiagnoses

| Ground Truth | Predicted | Frequency |
|--------------|-----------|----------|
| BRBPR | Rectal Bleeding | 3 |
| Abd pain | Abdominal Pain | 3 |
| Dyspnea, Transfer | Dyspnea | 3 |
| Chest pain, Transfer | Chest pain | 2 |
| Abnormal labs | Hypertension | 2 |
| UNKNOWN-CC | UNKNOWN | 2 |
| Abdominal distention, Abd pain, LETHAGIC | Hypotension | 1 |
| Abd pain, Abdominal distention | Abdominal Pain | 1 |
| n/v/d, Abd pain | Abdominal Pain | 1 |
| PICC LINE INFECTION | Suspected PICC line infection | 1 |

## Key Findings

### Areas for Improvement
- Diagnosis accuracy could be improved
- Triage level assignment accuracy needs improvement
- Some scenarios have very high response times

## Methodology

This evaluation uses the following metrics:
- **Diagnosis Accuracy:** Weighted combination of exact match (40%), Levenshtein similarity (30%), and keyword match (30%)
- **Triage Accuracy:** ESI level comparison
- **Performance:** Response time in milliseconds
- **Confidence:** AI system's stated confidence in the diagnosis

