# Data Upload Test Suite Documentation

## Overview

This comprehensive test suite validates the upload workflow for four core data entities in the TriageAssist application:
1. **TriageData** - Patient triage information (demographics, vitals, labs, history)
2. **Scenario** - Clinical case scenarios that bundle triage data with AI responses
3. **Grading** (ClinicalGrading) - Clinician evaluations and feedback on scenarios
4. **AIResponse** - AI-generated clinical assessments (triage level, diagnosis, treatment)

The test suite includes **49 test cases** organized into 8 test suites covering:
- Individual entity creation and validation
- Data relationships and referential integrity
- Full end-to-end upload workflows
- Error handling and edge cases
- Database constraints and field validation

---

## Test Location

**File:** `__tests__/api/data-upload.test.ts`

**Run Tests:**
```bash
npm test -- __tests__/api/data-upload.test.ts
```

**Run with Coverage:**
```bash
npm test -- __tests__/api/data-upload.test.ts --coverage
```

**Watch Mode:**
```bash
npm test -- __tests__/api/data-upload.test.ts --watch
```

---

## Mock Data Factories

The test suite provides factory functions to generate valid test data. Each factory can accept overrides:

### TriageData
```typescript
const triageData = createMockTriageData({
  age: 45,
  gender: 'F',
  chiefComplaint: { title: 'Headache', description: '...' }
});
```

**Fields Generated:**
- Demographics (age, gender, height, weight)
- Chief complaint & history
- Medical history, medications, allergies
- Vitals (temperature, pulse, BP, O2, glucose)
- Urinalysis results
- Lab results (troponin, creatinine, etc.)

### Scenario
```typescript
const scenario = createMockScenario({
  public: false,
  editable: false,
  metadata: { source: 'MIMIC-IV', version: '2.2' }
});
```

**Automatically Includes:**
- TriageData
- AIResponse (with triage, diagnosis, treatment)
- ScenarioContent
- Timestamps (createdAt, updatedAt)

### ClinicalGrading
```typescript
const grading = createMockClinicalGrading(scenarioId, clinicianId, {
  triageGrading: 5,
  diagnosisGrading: 4,
  treatmentGrading: 5
});
```

**Includes:**
- Individual grades for triage, diagnosis, treatment (1-5 scale)
- Feedback for each area
- Overall score calculation
- Clinician metadata

### AIResponse
```typescript
const aiResponse = createMockAIResponse({
  triage: createMockAITriageResponse({ level: '2', confidence: 0.95 }),
  diagnosis: createMockAIDiagnosisResponse({ confidence: 0.85 }),
  treatment: createMockAITreatmentResponse({ confidence: 0.88 })
});
```

**Contains Three Components:**
1. **Triage Response** - ESI level (1-5) with confidence
2. **Diagnosis Response** - Primary diagnosis with reasoning
3. **Treatment Response** - Array of recommendations

---

## Test Coverage

### 1. TriageData Upload (7 tests)
Validates patient data collection and lab results:
- ✓ Required fields presence
- ✓ Optional fields handling
- ✓ Medical history arrays
- ✓ Vital signs value ranges (36.5-41°C, HR 40-150, SpO2 85-100%)
- ✓ Urinalysis results handling
- ✓ Complex lab data structures
- ✓ Chief complaint variations

### 2. Scenario Upload (8 tests)
Tests scenario creation and component linking:
- ✓ Complete scenario with all components
- ✓ TriageData linking
- ✓ AIResponse linking
- ✓ ScenarioContent linking
- ✓ gradedBy tracking (initially empty)
- ✓ gradedBy updates with clinician IDs
- ✓ Metadata storage
- ✓ Public/private and editable/locked states

### 3. Clinical Grading Upload (9 tests)
Validates clinician evaluations:
- ✓ Grading creation with scenario and clinician IDs
- ✓ Independent grading of triage, diagnosis, treatment
- ✓ Feedback for each competency area
- ✓ Additional notes support
- ✓ Exclude flag for dataset filtering
- ✓ Score calculation (average of three grades)
- ✓ Public/private visibility control
- ✓ Clinician profile metadata
- ✓ Multiple gradings per scenario

### 4. AIResponse Upload (11 tests)
Tests AI-generated clinical assessments:
- ✓ Complete AIResponse creation
- ✓ ESI triage levels 1-5
- ✓ Triage reasoning documentation
- ✓ Confidence scores (0-1 range)
- ✓ Diagnosis with primary condition
- ✓ Diagnosis reasoning and evidence
- ✓ Treatment recommendations as arrays
- ✓ Treatment plan reasoning
- ✓ Confidence scores across all components
- ✓ Various confidence level combinations

### 5. Full Data Upload Workflow Integration (5 tests)
End-to-end scenarios:
- ✓ Complete workflow: TriageData → Scenario → AIResponse → Grading
- ✓ Batch upload of multiple scenarios
- ✓ Multiple gradings per scenario
- ✓ Referential integrity across entities
- ✓ Data preservation through update cycles

### 6. Data Validation (4 tests)
Field presence and relationship validation:
- ✓ Required TriageData fields
- ✓ Scenario relationships and constraints
- ✓ Score calculation accuracy
- ✓ Confidence score ranges

### 7. Error Handling and Edge Cases (5 tests)
Graceful handling of edge cases:
- ✓ Missing optional fields
- ✓ Empty arrays (medical history, allergies)
- ✓ Null scenario metadata
- ✓ Alternative chief complaint formats

---

## Database Schema Alignment

The test data conforms to the schema constraints:

### Primary Tables
- `scenarios` - Main case scenarios
- `scenario_content` - Patient demographics, vitals, labs
- `scenario_gradings` - Clinician evaluations
- `ai_scenario_responses` - AI responses to scenarios

### AI Response Detail Tables
- `ai_triage_responses` - Triage level and reasoning
- `ai_diagnosis_responses` - Diagnosis and reasoning
- `ai_treatment_responses` - Treatment recommendations

### Key Constraints Validated
- **UUIDs:** All IDs are valid UUIDs
- **Foreign Keys:** scenario_id references scenarios(id)
- **Author IDs:** clinician IDs reference auth.users(id)
- **Grades:** 1-5 scale for competency areas
- **Confidence:** 0-1 range for AI assessments
- **Timestamps:** created_at and updated_at present

---

## Usage Examples

### Example 1: Create and Validate a Complete Case
```typescript
// Create patient data
const triageData = createMockTriageData({
  age: 65,
  gender: 'M',
  medicalHistory: ['HTN', 'DM2', 'CAD']
});

// Create scenario with all components
const scenario = createMockScenario({ triageData });

// Create evaluation by clinician
const clinician1 = randomUUID();
const grading1 = createMockClinicalGrading(scenario.id, clinician1, {
  triageGrading: 5,
  diagnosisGrading: 4
});

// Add second evaluation
const clinician2 = randomUUID();
const grading2 = createMockClinicalGrading(scenario.id, clinician2, {
  triageGrading: 4,
  diagnosisGrading: 5
});

// Update scenario with grader list
const finalScenario = createMockScenario({
  ...scenario,
  gradedBy: [clinician1, clinician2]
});
```

### Example 2: Test Different Chief Complaints
```typescript
const complaints = [
  { title: 'Chest Pain', description: 'Substernal pressure' },
  { title: 'Shortness of Breath', description: 'Acute dyspnea' },
  { title: 'Altered Mental Status', description: 'Confusion' }
];

complaints.forEach(complaint => {
  const scenario = createMockScenario({
    content: createMockScenarioContent({
      chiefComplaint: complaint
    })
  });
  // Run tests...
});
```

### Example 3: Test Various AI Confidence Levels
```typescript
const confidenceLevels = [0.7, 0.8, 0.85, 0.92, 0.95];

confidenceLevels.forEach(confidence => {
  const aiResponse = createMockAIResponse({
    triage: createMockAITriageResponse({ confidence }),
    diagnosis: createMockAIDiagnosisResponse({ confidence: confidence - 0.05 }),
    treatment: createMockAITreatmentResponse({ confidence: confidence - 0.02 })
  });
  // Run tests...
});
```

---

## Integration with API Routes

These test entities map to API endpoints in `app/api/scenarios/route.ts`:

### POST Actions
- **ADD_SCENARIO** - Creates new scenario with TriageData and content
- **ADD_GRADING** - Submits clinical evaluation for scenario

### GET Actions
- **GET_UNGRADED** - Fetches scenarios awaiting grading

---

## Best Practices

1. **Use Factories for Consistency**
   ```typescript
   // ✓ Good - Uses factory with defaults
   const triageData = createMockTriageData();
   
   // ✗ Avoid - Manual object creation loses validation
   const triageData = { subjectId: 'X', age: 65 };
   ```

2. **Override Specific Fields Only**
   ```typescript
   // ✓ Good - Preserves other defaults
   const scenario = createMockScenario({ public: false });
   
   // ✗ Avoid - Rebuilds entire object
   const scenario = { ...mockScenario, public: false };
   ```

3. **Validate Relationships**
   ```typescript
   // ✓ Good - Ensures referential integrity
   expect(scenario.triageData?.id).toBe(triageData.id);
   
   // ✗ Avoid - Only checks existence
   expect(scenario.triageData).toBeDefined();
   ```

4. **Test Edge Cases**
   ```typescript
   // ✓ Good - Tests both states
   const publicScenario = createMockScenario({ public: true });
   const privateScenario = createMockScenario({ public: false });
   ```

---

## Maintenance

### Adding New Tests
1. Add test in appropriate describe block
2. Use existing factories with overrides
3. Follow naming: "should [action] [condition]"
4. Include assertions for both success and edge cases

### Updating Factories
1. Keep backward compatible (add new fields as optional)
2. Update type definitions if schema changes
3. Add comments for complex field choices
4. Run full test suite to verify impact

### Validating Against Schema
1. Cross-reference types.ts with database schema
2. Verify constraints (ranges, formats, relationships)
3. Test migrations with actual Supabase during deployment

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with UUID validation
- **Solution:** Ensure randomUUID() is imported from 'crypto'

**Issue:** Type errors on optional fields
- **Solution:** Use `Partial<Type>` in factory overrides

**Issue:** Score calculation mismatches
- **Solution:** Use `toBeCloseTo()` for floating-point comparisons

### Debug Mode
```bash
npm test -- __tests__/api/data-upload.test.ts --verbose
```

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Tests | 49 |
| Test Suites | 8 |
| Mock Factories | 7 |
| TriageData Fields | 25+ |
| AIResponse Components | 3 |
| Grading Competencies | 3 |
| Confidence Score Range | 0-1 |
| Grade Scale | 1-5 |
| ESI Levels | 1-5 |

---

## Resources

- Database Schema: `schema.sql`
- Type Definitions: `lib/types.ts`
- API Route: `app/api/scenarios/route.ts`
- Test Setup: `jest.setup.tsx`
- Jest Config: `jest.config.ts`
