import pandas as pd
from datetime import datetime

# Read the data files
edstays = pd.read_csv('edstays.csv')
diagnosis = pd.read_csv('diagnosis.csv')

# Convert datetime columns
edstays['intime'] = pd.to_datetime(edstays['intime'])
edstays['outtime'] = pd.to_datetime(edstays['outtime'])

# Calculate ED length of stay in minutes and hours
edstays['ed_stay_minutes'] = (edstays['outtime'] - edstays['intime']).dt.total_seconds() / 60
edstays['ed_stay_hours'] = edstays['ed_stay_minutes'] / 60

# Count diagnoses per patient per stay
diagnosis_counts = diagnosis.groupby(['subject_id', 'stay_id']).size().reset_index(name='diagnosis_count')

# Merge diagnosis information with ED stays
result = edstays.merge(diagnosis_counts, on=['subject_id', 'stay_id'], how='left')
result['diagnosis_count'] = result['diagnosis_count'].fillna(0).astype(int)

# Add triage information (acuity level)
triage = pd.read_csv('triage.csv')[['subject_id', 'stay_id', 'acuity', 'chiefcomplaint']].drop_duplicates()
result = result.merge(triage, on=['subject_id', 'stay_id'], how='left')

# Select and reorder columns for output
output_cols = [
    'subject_id', 
    'stay_id', 
    'intime', 
    'outtime', 
    'ed_stay_minutes', 
    'ed_stay_hours',
    'acuity',
    'chiefcomplaint',
    'diagnosis_count',
    'disposition',
    'gender',
    'race'
]

output = result[output_cols].copy()

# Save to CSV
output.to_csv('triage_timing_analysis.csv', index=False)

# Print summary statistics
print("\n" + "="*70)
print("ED TRIAGE TIMING ANALYSIS - SUMMARY")
print("="*70)
print(f"\nTotal unique ED stays: {len(output)}")
print(f"\nED Length of Stay Statistics (in hours):")
print(f"  Mean:   {output['ed_stay_hours'].mean():.2f} hours")
print(f"  Median: {output['ed_stay_hours'].median():.2f} hours")
print(f"  Min:    {output['ed_stay_hours'].min():.2f} hours")
print(f"  Max:    {output['ed_stay_hours'].max():.2f} hours")
print(f"  Std:    {output['ed_stay_hours'].std():.2f} hours")

print(f"\nDiagnosis Documentation:")
print(f"  Patients with diagnoses:    {(output['diagnosis_count'] > 0).sum()} ({(output['diagnosis_count'] > 0).sum()/len(output)*100:.1f}%)")
print(f"  Patients without diagnoses: {(output['diagnosis_count'] == 0).sum()} ({(output['diagnosis_count'] == 0).sum()/len(output)*100:.1f}%)")

print(f"\nTriage Acuity Distribution:")
acuity_counts = output['acuity'].value_counts().sort_index()
for acuity, count in acuity_counts.items():
    pct = count / len(output) * 100
    print(f"  Level {acuity}: {count:3d} patients ({pct:5.1f}%)")

print(f"\nED Length of Stay by Acuity Level:")
for acuity in sorted(output['acuity'].dropna().unique()):
    subset = output[output['acuity'] == acuity]
    print(f"  Level {acuity}: {subset['ed_stay_hours'].mean():.2f} hours (n={len(subset)})")

print(f"\nOutput saved to: triage_timing_analysis.csv")
print("="*70 + "\n")
