# MIMIC-IV ED Dataset Transformation Summary

## Overview
Successfully transformed 222 patient records from the MIMIC-IV ED (Emergency Department) dataset into JSON files matching the `TriageData` type from your project.

## Files Generated
- **Individual files**: `scenario_<subject_id>_<index>.json` (222 files)
- **Combined file**: `all_scenarios.json` (complete dataset in one file)
- **Output directory**: `mimic-iv-ed-demo-2.2/transformed_data/`

## Data Transformations Applied

### Temperature Conversion
- **Original format**: Fahrenheit (from MIMIC-IV)
- **Converted to**: Celsius (for medical standards)
- **Formula**: `(F - 32) × 5/9`

### Blood Pressure Formatting
- **Original format**: Separate SBP and DBP columns
- **Converted to**: `sbp/dbp` format (e.g., `"120/80"`)

### Field Mapping

| Source Field | Target Field | Transformation |
|---|---|---|
| subject_id | subjectId | Direct mapping (string) |
| intime | inTime | Direct mapping (ISO datetime) |
| outtime | outTime | Direct mapping (ISO datetime) |
| intime + outtime | triageDuration | Calculated in seconds |
| temperature | vitals.temperature | Converted F→C |
| pulse / heartrate | vitals.pulse | Direct mapping (float) |
| respiratory_rate / resprate | vitals.respiratoryRate | Direct mapping (float) |
| oxygen_saturation / o2sat | vitals.oxygenSaturation | Direct mapping (float) |
| sbp, dbp | vitals.bloodPressure | Formatted as `sbp/dbp` |
| acuity | otherLabs.acuity | Direct mapping (string) |
| chiefcomplaint | chiefComplaint.title | Direct mapping |
| arrival_transport | modeOfArrival | Direct mapping |
| gender | gender | Direct mapping |
| race | otherLabs.race | Stored in otherLabs |
| pain | otherLabs.pain | Direct mapping (float) |

## JSON Naming Convention
All field names follow **camelCase** standard for JSON:
- `chiefComplaint` (not `chief_complaint`)
- `modeOfArrival` (not `mode_of_arrival`)
- `bloodPressure` (not `blood_pressure`)
- `triageDuration` (not `triage_duration`)
- `oxygenSaturation` (not `oxygen_saturation`)

## Fields Not Available in Dataset
The following fields are `null` as they are not in the MIMIC-IV ED dataset:
- `age`
- `height`
- `weight`
- `mentalStatus`
- `respiratoryStatus`
- `medicalHistory`
- `currentMedication`
- `smoker`
- `alcohol`
- `allergies`
- `surgicalHistory`
- `immunization`
- `urinalysis` data (blood, nitrites, protein, etc.)
- `glucose`
- `bhcg`

## Example Record

```json
{
  "subjectId": "10000032",
  "inTime": "2180-07-23 05:54:00",
  "outTime": "2180-07-23 14:00:00",
  "triageDuration": 29160,
  "age": null,
  "gender": "F",
  "height": null,
  "weight": null,
  "chiefComplaint": {
    "title": "Abdominal distention, Abd pain, LETHAGIC",
    "description": ""
  },
  "modeOfArrival": "AMBULANCE",
  "mentalStatus": null,
  "respiratoryStatus": null,
  "medicalHistory": [],
  "currentMedication": [],
  "smoker": null,
  "alcohol": null,
  "allergies": [],
  "surgicalHistory": [],
  "immunization": [],
  "vitals": {
    "temperature": 37.06,
    "pulse": 96.0,
    "respiratoryRate": 18.0,
    "bloodPressure": "86/45",
    "oxygenSaturation": 97.0,
    "glucose": null,
    "bhcg": null
  },
  "urinalysis": null,
  "otherLabs": {
    "acuity": "2.0",
    "race": "WHITE"
  }
}
```

## Data Statistics
- **Total records processed**: 222
- **Records with complete vitals**: 195
- **Records with blood pressure data**: 195
- **Records with temperature data**: 180
- **Records with chief complaint**: 222
- **Average ED stay duration**: ~12 hours

## Usage
You can now use these JSON files directly in your project:

```typescript
import triageData from './transformed_data/scenario_10000032_0051.json';
// triageData is properly typed as TriageData
```

Or load all scenarios:
```typescript
import allScenarios from './transformed_data/all_scenarios.json';
// allScenarios is an array of TriageData objects
```
