#!/usr/bin/env python3
"""
Transform MIMIC-IV ED dataset to TriageData JSON format.
Reads CSV files and converts them to match the project's TriageData type.
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
import os

# Get the directory containing this script
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "mimic-iv-ed-demo-2.2" / "ed"
OUTPUT_DIR = SCRIPT_DIR / "transformed_data"

# Create output directory
OUTPUT_DIR.mkdir(exist_ok=True)


def fahrenheit_to_celsius(temp_f: Optional[float]) -> Optional[float]:
    """Convert Fahrenheit to Celsius."""
    if pd.isna(temp_f) or temp_f is None:
        return None
    return round((float(temp_f) - 32) * 5 / 9, 2)


def format_blood_pressure(sbp: Any, dbp: Any) -> Optional[str]:
    """Format blood pressure as sbp/dbp."""
    if pd.isna(sbp) or pd.isna(dbp) or sbp is None or dbp is None:
        return None
    return f"{int(sbp)}/{int(dbp)}"


def calculate_triage_duration(intime: str, outtime: str) -> Optional[int]:
    """Calculate triage duration in seconds."""
    try:
        in_dt = pd.to_datetime(intime)
        out_dt = pd.to_datetime(outtime)
        duration = (out_dt - in_dt).total_seconds()
        return int(duration) if not pd.isna(duration) else None
    except:
        return None


def parse_vital_fields(value: Any) -> Optional[float]:
    """Parse vital sign fields, handling NaN and None."""
    if pd.isna(value) or value is None or value == "":
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def transform_dataset():
    """Main transformation function."""
    print("Loading CSV files...")
    
    # Load CSVs
    try:
        triage_df = pd.read_csv(DATA_DIR / "triage.csv")
        vitalsign_df = pd.read_csv(DATA_DIR / "vitalsign.csv")
        edstays_df = pd.read_csv(DATA_DIR / "edstays.csv")
        print(f"✓ Loaded {len(triage_df)} triage records")
        print(f"✓ Loaded {len(vitalsign_df)} vital sign records")
        print(f"✓ Loaded {len(edstays_df)} ED stay records")
    except FileNotFoundError as e:
        print(f"Error loading CSV files: {e}")
        return
    
    # Create a mapping of stay_id to ED stay info
    ed_stay_map = {}
    for _, row in edstays_df.iterrows():
        stay_id = row["stay_id"]
        ed_stay_map[stay_id] = {
            "subject_id": row["subject_id"],
            "intime": row["intime"],
            "outtime": row["outtime"],
            "gender": row["gender"],
            "race": row["race"],
            "arrival_transport": row["arrival_transport"],
        }
    
    # Create a mapping of stay_id to vitals (get the latest vitals)
    vitals_map = {}
    for _, row in vitalsign_df.iterrows():
        stay_id = row["stay_id"]
        if stay_id not in vitals_map:
            vitals_map[stay_id] = row
        else:
            # Keep the most recent one
            current_time = pd.to_datetime(vitals_map[stay_id]["charttime"])
            new_time = pd.to_datetime(row["charttime"])
            if new_time > current_time:
                vitals_map[stay_id] = row
    
    # Transform triage data
    transformed_records = []
    errors = []
    
    for idx, triage_row in triage_df.iterrows():
        try:
            stay_id = triage_row["stay_id"]
            
            # Skip if we don't have ED stay data
            if stay_id not in ed_stay_map:
                continue
            
            ed_stay = ed_stay_map[stay_id]
            vitals = vitals_map.get(stay_id)
            
            # Extract vitals (prefer vitalsign data, fallback to triage data)
            temperature = None
            if vitals is not None and pd.notna(vitals.get("temperature")):
                temperature = fahrenheit_to_celsius(vitals["temperature"])
            elif pd.notna(triage_row.get("temperature")):
                temperature = fahrenheit_to_celsius(triage_row["temperature"])
            
            pulse = parse_vital_fields(vitals["pulse"] if vitals is not None else triage_row.get("heartrate"))
            respiratory_rate = parse_vital_fields(vitals["respiratory_rate"] if vitals is not None else triage_row.get("resprate"))
            oxygen_saturation = parse_vital_fields(vitals["oxygen_saturation"] if vitals is not None else triage_row.get("o2sat"))
            
            # Blood pressure
            sbp = vitals["sbp"] if vitals is not None else triage_row.get("sbp")
            dbp = vitals["dbp"] if vitals is not None else triage_row.get("dbp")
            blood_pressure = format_blood_pressure(sbp, dbp)
            
            # Triage duration
            triage_duration = calculate_triage_duration(ed_stay["intime"], ed_stay["outtime"])
            
            # Build TriageData object
            triage_data = {
                "subjectId": str(ed_stay["subject_id"]),
                "inTime": ed_stay["intime"],
                "outTime": ed_stay["outtime"],
                "triageDuration": triage_duration,
                "age": None,  # Not available in this dataset
                "gender": ed_stay["gender"] if pd.notna(ed_stay["gender"]) else None,
                "height": None,  # Not available in this dataset
                "weight": None,  # Not available in this dataset
                "chiefComplaint": {
                    "title": str(triage_row["chiefcomplaint"]) if pd.notna(triage_row.get("chiefcomplaint")) else "Unknown",
                    "description": ""
                },
                "modeOfArrival": ed_stay["arrival_transport"] if pd.notna(ed_stay["arrival_transport"]) else None,
                "mentalStatus": None,  # Not available in this dataset
                "respiratoryStatus": None,  # Not available in this dataset
                "medicalHistory": [],
                "currentMedication": [],
                "smoker": None,
                "alcohol": None,
                "allergies": [],
                "surgicalHistory": [],
                "immunization": [],
                "vitals": {
                    "temperature": temperature,
                    "pulse": pulse,
                    "respiratoryRate": respiratory_rate,
                    "bloodPressure": blood_pressure,
                    "oxygenSaturation": oxygen_saturation,
                    "glucose": None,  # Not available in vitals data
                    "bhcg": None,  # Not available in vitals data
                },
                "urinalysis": None,  # Not available in this dataset
                "otherLabs": {
                    "acuity": str(triage_row["acuity"]) if pd.notna(triage_row.get("acuity")) else None,
                    "pain": parse_vital_fields(vitals["pain"] if vitals is not None else triage_row.get("pain")),
                    "race": ed_stay["race"] if pd.notna(ed_stay["race"]) else None,
                }
            }
            
            # Clean up None values in otherLabs
            triage_data["otherLabs"] = {k: v for k, v in triage_data["otherLabs"].items() if v is not None}
            
            transformed_records.append(triage_data)
            
        except Exception as e:
            errors.append(f"Error processing record {idx}: {str(e)}")
    
    # Save individual JSON files
    print(f"\nTransforming {len(transformed_records)} records...")
    for idx, record in enumerate(transformed_records, 1):
        output_file = OUTPUT_DIR / f"scenario_{record['subjectId']}_{idx:04d}.json"
        with open(output_file, "w") as f:
            json.dump(record, f, indent=2, default=str)
    
    # Also save as a combined JSON array
    combined_file = OUTPUT_DIR / "all_scenarios.json"
    with open(combined_file, "w") as f:
        json.dump(transformed_records, f, indent=2, default=str)
    
    # Print summary
    print(f"\n✓ Successfully transformed {len(transformed_records)} records")
    print(f"✓ Output saved to: {OUTPUT_DIR}")
    print(f"✓ Individual files: scenario_<subject_id>_<index>.json")
    print(f"✓ Combined file: all_scenarios.json")
    
    if errors:
        print(f"\nWarnings ({len(errors)}):")
        for error in errors[:5]:  # Show first 5 errors
            print(f"  - {error}")
        if len(errors) > 5:
            print(f"  ... and {len(errors) - 5} more")
    
    # Print sample record
    if transformed_records:
        print("\n" + "="*60)
        print("Sample transformed record:")
        print("="*60)
        print(json.dumps(transformed_records[0], indent=2, default=str))


if __name__ == "__main__":
    transform_dataset()
