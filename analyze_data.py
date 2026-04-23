#!/usr/bin/env python3
"""
Dataset Analysis Script - ZERO ERROR TOLERANCE
Analyze salarydata.csv structure, data types, missing values, and distributions
"""

import pandas as pd
import numpy as np
import json

print("="*80)
print("SALARY PREDICTION APP - DATASET ANALYSIS")
print("="*80)

# Load dataset
df = pd.read_csv('salarydata.csv')

print(f"\n✓ Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
print(f"✓ Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

print("\n" + "="*80)
print("COLUMN INFORMATION")
print("="*80)
print(df.info())

print("\n" + "="*80)
print("DATA TYPES & NULL VALUES")
print("="*80)
for col in df.columns:
    null_count = df[col].isnull().sum()
    null_pct = (null_count / len(df)) * 100
    dtype = df[col].dtype
    unique = df[col].nunique()
    print(f"{col:25} | Type: {str(dtype):10} | Nulls: {null_count:6} ({null_pct:5.2f}%) | Unique: {unique:6}")

print("\n" + "="*80)
print("NUMERICAL COLUMNS - STATISTICS")
print("="*80)
print(df.describe())

print("\n" + "="*80)
print("CATEGORICAL COLUMNS - VALUE COUNTS")
print("="*80)

categorical_cols = ['job_title', 'education_level', 'industry', 'company_size', 'location', 'remote_work']

for col in categorical_cols:
    if col in df.columns:
        print(f"\n--- {col.upper()} ---")
        print(df[col].value_counts().head(15))

print("\n" + "="*80)
print("SALARY ANALYSIS")
print("="*80)
print(f"Min salary: ${df['salary'].min():,.2f}")
print(f"Max salary: ${df['salary'].max():,.2f}")
print(f"Mean salary: ${df['salary'].mean():,.2f}")
print(f"Median salary: ${df['salary'].median():,.2f}")
print(f"Std Dev: ${df['salary'].std():,.2f}")

print("\n--- Salary Distribution (Quartiles) ---")
print(df['salary'].quantile([0, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 1.0]))

print("\n" + "="*80)
print("CHECKING FOR ANOMALIES")
print("="*80)

# Check for negative values
for col in ['experience_years', 'skills_count', 'certifications', 'salary']:
    if col in df.columns:
        negative_count = (df[col] < 0).sum()
        if negative_count > 0:
            print(f"⚠️  WARNING: {negative_count} negative values in {col}")
        else:
            print(f"✓ No negative values in {col}")

# Check for unrealistic experience years
unrealistic_exp = (df['experience_years'] > 50).sum()
if unrealistic_exp > 0:
    print(f"⚠️  WARNING: {unrealistic_exp} rows with experience > 50 years")
else:
    print(f"✓ All experience values <= 50 years")

# Check for outliers using IQR method
Q1 = df['salary'].quantile(0.25)
Q3 = df['salary'].quantile(0.75)
IQR = Q3 - Q1
outliers = ((df['salary'] < (Q1 - 1.5 * IQR)) | (df['salary'] > (Q3 + 1.5 * IQR))).sum()
print(f"⚠️  Potential outliers (IQR method): {outliers} rows ({outliers/len(df)*100:.2f}%)")

print("\n" + "="*80)
print("SAMPLE ROWS (First 10)")
print("="*80)
print(df.head(10).to_string())

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)

# Save summary to JSON
summary = {
    "total_rows": len(df),
    "total_columns": len(df.columns),
    "columns": list(df.columns),
    "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
    "null_counts": {col: int(df[col].isnull().sum()) for col in df.columns},
    "numerical_stats": {
        "salary": {
            "min": float(df['salary'].min()),
            "max": float(df['salary'].max()),
            "mean": float(df['salary'].mean()),
            "median": float(df['salary'].median()),
            "std": float(df['salary'].std())
        },
        "experience_years": {
            "min": float(df['experience_years'].min()),
            "max": float(df['experience_years'].max()),
            "mean": float(df['experience_years'].mean()),
        },
        "skills_count": {
            "min": float(df['skills_count'].min()),
            "max": float(df['skills_count'].max()),
            "mean": float(df['skills_count'].mean()),
        }
    },
    "categorical_unique_counts": {col: int(df[col].nunique()) for col in categorical_cols if col in df.columns}
}

with open('dataset_analysis.json', 'w') as f:
    json.dump(summary, f, indent=2)

print("\n✓ Analysis summary saved to dataset_analysis.json")
