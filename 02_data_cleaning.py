#!/usr/bin/env python3
"""
PHASE 2: DATA CLEANING & FEATURE ENGINEERING
ZERO ERROR TOLERANCE - Manual verification at each step
"""

import pandas as pd
import numpy as np
import json
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("PHASE 2: DATA CLEANING & FEATURE ENGINEERING")
print("="*80)

# Load dataset
print("\n[1/7] Loading dataset...")
df = pd.read_csv('salarydata.csv')
print(f"✓ Loaded {len(df)} rows, {len(df.columns)} columns")

# Verify no null values (should be 0 from Phase 1)
print("\n[2/7] Verifying data integrity...")
null_counts = df.isnull().sum()
if null_counts.sum() == 0:
    print("✓ VERIFIED: No null values detected")
else:
    print(f"❌ ERROR: Found null values:\n{null_counts[null_counts > 0]}")
    exit(1)

# Check for duplicate rows
duplicates = df.duplicated().sum()
if duplicates > 0:
    print(f"⚠️  WARNING: Found {duplicates} duplicate rows - removing them")
    df = df.drop_duplicates()
    print(f"✓ Removed duplicates, now {len(df)} rows")
else:
    print(f"✓ VERIFIED: No duplicate rows")

# Outlier analysis using IQR method
print("\n[3/7] Analyzing outliers...")
Q1 = df['salary'].quantile(0.25)
Q3 = df['salary'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

outliers = df[(df['salary'] < lower_bound) | (df['salary'] > upper_bound)]
outlier_pct = (len(outliers) / len(df)) * 100

print(f"Salary IQR: Q1=${Q1:,.0f}, Q3=${Q3:,.0f}, IQR=${IQR:,.0f}")
print(f"Outlier bounds: ${lower_bound:,.0f} - ${upper_bound:,.0f}")
print(f"Outliers detected: {len(outliers)} ({outlier_pct:.2f}%)")

# Decision: Keep outliers if < 5% (they might be legitimate high earners)
if outlier_pct < 5.0:
    print(f"✓ DECISION: Keeping outliers (< 5% threshold)")
    df_clean = df.copy()
else:
    print(f"⚠️  DECISION: Removing outliers (>= 5% threshold)")
    df_clean = df[(df['salary'] >= lower_bound) & (df['salary'] <= upper_bound)]
    print(f"✓ Cleaned dataset: {len(df_clean)} rows")

# Save a copy of 10 random samples BEFORE encoding for manual verification
print("\n[4/7] Saving samples for manual verification...")
verification_samples = df_clean.sample(n=10, random_state=42)
verification_samples.to_csv('verification_samples_raw.csv', index=False)
print("✓ Saved 10 random samples to verification_samples_raw.csv")
print("\nSample preview:")
print(verification_samples[['job_title', 'experience_years', 'education_level', 'industry', 'location', 'salary']].to_string(index=False))

# Define feature groups
print("\n[5/7] Preparing feature encoding...")

# Categorical features - need encoding
categorical_features = ['job_title', 'education_level', 'industry', 'company_size', 'location', 'remote_work']

# Numerical features - need scaling
numerical_features = ['experience_years', 'skills_count', 'certifications']

# Target variable
target = 'salary'

# Get unique values for each categorical feature (for web app dropdowns)
categorical_values = {}
for col in categorical_features:
    categorical_values[col] = sorted(df_clean[col].unique().tolist())
    print(f"  {col}: {len(categorical_values[col])} unique values")

# Save categorical values for the web app
with open('categorical_values.json', 'w') as f:
    json.dump(categorical_values, f, indent=2)
print("✓ Saved categorical values to categorical_values.json")

# Create ordinal mappings for ordered categories
education_order = {
    'High School': 1,
    'Diploma': 2,
    'Bachelor': 3,
    'Master': 4,
    'PhD': 5
}

company_size_order = {
    'Startup': 1,
    'Small': 2,
    'Medium': 3,
    'Large': 4,
    'Enterprise': 5
}

# Apply ordinal encoding
print("\n[6/7] Applying feature transformations...")
df_encoded = df_clean.copy()

df_encoded['education_level_encoded'] = df_encoded['education_level'].map(education_order)
df_encoded['company_size_encoded'] = df_encoded['company_size'].map(company_size_order)

# One-hot encoding for nominal categorical features
nominal_features = ['job_title', 'industry', 'location', 'remote_work']

print(f"  Applying one-hot encoding to: {nominal_features}")
df_encoded = pd.get_dummies(df_encoded, columns=nominal_features, prefix=nominal_features)

# Drop original categorical columns that were encoded
df_encoded = df_encoded.drop(['education_level', 'company_size'], axis=1)

print(f"✓ Encoded dataset shape: {df_encoded.shape}")
print(f"✓ Total features after encoding: {df_encoded.shape[1] - 1} (excluding target)")

# Prepare features (X) and target (y)
X = df_encoded.drop('salary', axis=1)
y = df_encoded['salary']

# Get feature names for later use
feature_names = X.columns.tolist()

# Save feature names
with open('feature_names.json', 'w') as f:
    json.dump(feature_names, f, indent=2)
print(f"✓ Saved {len(feature_names)} feature names to feature_names.json")

# Split data into train and test sets (80/20 split)
print("\n[7/7] Creating train/test split...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=True
)

print(f"✓ Training set: {len(X_train)} samples ({len(X_train)/len(X)*100:.1f}%)")
print(f"✓ Test set: {len(X_test)} samples ({len(X_test)/len(X)*100:.1f}%)")

# Verify no data leakage - check train/test split
print("\n  Verifying train/test split integrity...")
train_indices = X_train.index.tolist()
test_indices = X_test.index.tolist()
overlap = set(train_indices) & set(test_indices)
if len(overlap) == 0:
    print("  ✓ VERIFIED: No overlap between train and test sets")
else:
    print(f"  ❌ ERROR: Found {len(overlap)} overlapping indices!")
    exit(1)

# Scale numerical features
print("\n  Applying StandardScaler to numerical features...")
scaler = StandardScaler()

# Get column indices for numerical features
numerical_indices = [X_train.columns.get_loc(col) for col in numerical_features]

# Fit scaler on training data only
X_train_array = X_train.values
X_test_array = X_test.values

X_train_array[:, numerical_indices] = scaler.fit_transform(X_train_array[:, numerical_indices])
X_test_array[:, numerical_indices] = scaler.transform(X_test_array[:, numerical_indices])

# Convert back to DataFrames
X_train_scaled = pd.DataFrame(X_train_array, columns=X_train.columns, index=X_train.index)
X_test_scaled = pd.DataFrame(X_test_array, columns=X_test.columns, index=X_test.index)

print(f"✓ Applied scaling to {len(numerical_features)} numerical features")

# Save preprocessed data
print("\n[SAVING] Writing preprocessed data to disk...")
X_train_scaled.to_csv('X_train.csv', index=False)
X_test_scaled.to_csv('X_test.csv', index=False)
y_train.to_csv('y_train.csv', index=False, header=['salary'])
y_test.to_csv('y_test.csv', index=False, header=['salary'])
print("✓ Saved: X_train.csv, X_test.csv, y_train.csv, y_test.csv")

# Save preprocessing artifacts (scaler, encoders, mappings)
preprocessing_info = {
    'scaler': scaler,
    'education_order': education_order,
    'company_size_order': company_size_order,
    'feature_names': feature_names,
    'numerical_features': numerical_features,
    'numerical_indices': numerical_indices,
    'categorical_values': categorical_values,
    'original_shape': df_clean.shape,
    'encoded_shape': df_encoded.shape,
    'train_samples': len(X_train),
    'test_samples': len(X_test)
}

with open('preprocessing_info.pkl', 'wb') as f:
    pickle.dump(preprocessing_info, f)
print("✓ Saved: preprocessing_info.pkl")

# Save summary statistics
summary = {
    'total_rows_original': len(df),
    'total_rows_cleaned': len(df_clean),
    'duplicates_removed': len(df) - len(df_clean) if len(df) != len(df_clean) else 0,
    'outliers_detected': len(outliers),
    'outliers_removed': len(outliers) if outlier_pct >= 5.0 else 0,
    'features_before_encoding': len(categorical_features) + len(numerical_features),
    'features_after_encoding': len(feature_names),
    'train_samples': len(X_train),
    'test_samples': len(X_test),
    'salary_stats': {
        'min': float(y.min()),
        'max': float(y.max()),
        'mean': float(y.mean()),
        'median': float(y.median()),
        'std': float(y.std())
    }
}

with open('cleaning_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)
print("✓ Saved: cleaning_summary.json")

print("\n" + "="*80)
print("PHASE 2 COMPLETE - DATA CLEANING & FEATURE ENGINEERING")
print("="*80)
print(f"\n📊 SUMMARY:")
print(f"   Original rows: {len(df):,}")
print(f"   Cleaned rows: {len(df_clean):,}")
print(f"   Features before encoding: {len(categorical_features) + len(numerical_features)}")
print(f"   Features after encoding: {len(feature_names)}")
print(f"   Training samples: {len(X_train):,}")
print(f"   Test samples: {len(X_test):,}")
print(f"\n✅ VERIFICATION REQUIRED:")
print(f"   1. Review 'verification_samples_raw.csv' manually")
print(f"   2. Verify feature names in 'feature_names.json'")
print(f"   3. Check categorical values in 'categorical_values.json'")
print(f"   4. Confirm no errors in 'cleaning_summary.json'")
print(f"\n🎯 NEXT STEP: Manually verify 10 samples, then proceed to Phase 3 (Model Training)")
print("="*80)
