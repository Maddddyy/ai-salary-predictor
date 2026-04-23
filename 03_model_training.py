#!/usr/bin/env python3
"""
PHASE 3: MODEL DEVELOPMENT & TRAINING
ZERO ERROR TOLERANCE - Explainable ML with SHAP
"""

import pandas as pd
import numpy as np
import pickle
import json
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import shap
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("PHASE 3: MODEL DEVELOPMENT & TRAINING")
print("="*80)

# Load preprocessed data
print("\n[1/8] Loading preprocessed data...")
X_train = pd.read_csv('X_train.csv')
X_test = pd.read_csv('X_test.csv')
y_train = pd.read_csv('y_train.csv')['salary']
y_test = pd.read_csv('y_test.csv')['salary']

print(f"✓ Training set: {len(X_train):,} samples, {X_train.shape[1]} features")
print(f"✓ Test set: {len(X_test):,} samples")
print(f"✓ Target range: ${y_train.min():,.0f} - ${y_train.max():,.0f}")

# Load preprocessing info
with open('preprocessing_info.pkl', 'rb') as f:
    preprocessing_info = pickle.load(f)

feature_names = preprocessing_info['feature_names']
print(f"✓ Feature names loaded: {len(feature_names)} features")

# ============================================================================
# MODEL 1: Random Forest Regressor (Primary Model)
# ============================================================================
print("\n[2/8] Training Random Forest Regressor...")
print("  Hyperparameters:")
print("    - n_estimators: 100")
print("    - max_depth: 20")
print("    - min_samples_split: 10")
print("    - min_samples_leaf: 5")
print("    - random_state: 42")
print("    - n_jobs: -1 (use all CPU cores)")

rf_model = RandomForestRegressor(
    n_estimators=100,
    max_depth=20,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1,
    verbose=0
)

print("  Training in progress...")
rf_model.fit(X_train, y_train)
print("✓ Random Forest trained successfully")

# Predictions
print("\n[3/8] Generating predictions...")
y_train_pred_rf = rf_model.predict(X_train)
y_test_pred_rf = rf_model.predict(X_test)

# Evaluation metrics
print("\n[4/8] Evaluating Random Forest model...")

# Training metrics
train_r2_rf = r2_score(y_train, y_train_pred_rf)
train_mae_rf = mean_absolute_error(y_train, y_train_pred_rf)
train_rmse_rf = np.sqrt(mean_squared_error(y_train, y_train_pred_rf))
train_mape_rf = np.mean(np.abs((y_train - y_train_pred_rf) / y_train)) * 100

# Test metrics
test_r2_rf = r2_score(y_test, y_test_pred_rf)
test_mae_rf = mean_absolute_error(y_test, y_test_pred_rf)
test_rmse_rf = np.sqrt(mean_squared_error(y_test, y_test_pred_rf))
test_mape_rf = np.mean(np.abs((y_test - y_test_pred_rf) / y_test)) * 100

print("\n  📊 RANDOM FOREST PERFORMANCE:")
print(f"     Training Set:")
print(f"       R² Score: {train_r2_rf:.4f}")
print(f"       MAE: ${train_mae_rf:,.2f}")
print(f"       RMSE: ${train_rmse_rf:,.2f}")
print(f"       MAPE: {train_mape_rf:.2f}%")
print(f"\n     Test Set:")
print(f"       R² Score: {test_r2_rf:.4f}")
print(f"       MAE: ${test_mae_rf:,.2f}")
print(f"       RMSE: ${test_rmse_rf:,.2f}")
print(f"       MAPE: {test_mape_rf:.2f}%")

# Check if model meets success criteria
if test_r2_rf >= 0.85 and test_mae_rf <= 10000:
    print(f"\n  ✅ SUCCESS CRITERIA MET:")
    print(f"     ✓ R² Score >= 0.85: {test_r2_rf:.4f}")
    print(f"     ✓ MAE <= $10,000: ${test_mae_rf:,.2f}")
else:
    print(f"\n  ⚠️  SUCCESS CRITERIA NOT MET:")
    if test_r2_rf < 0.85:
        print(f"     ✗ R² Score < 0.85: {test_r2_rf:.4f}")
    if test_mae_rf > 10000:
        print(f"     ✗ MAE > $10,000: ${test_mae_rf:,.2f}")

# Feature Importance
print("\n[5/8] Extracting feature importances...")
feature_importance = pd.DataFrame({
    'feature': feature_names,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n  Top 15 Most Important Features:")
for idx, row in feature_importance.head(15).iterrows():
    print(f"    {row['feature']:40} {row['importance']:.4f}")

# Save feature importance
feature_importance.to_csv('feature_importance.csv', index=False)
print("\n✓ Saved feature importance to feature_importance.csv")

# Plot feature importance
plt.figure(figsize=(12, 8))
top_features = feature_importance.head(20)
plt.barh(range(len(top_features)), top_features['importance'])
plt.yticks(range(len(top_features)), top_features['feature'])
plt.xlabel('Importance')
plt.title('Top 20 Feature Importances (Random Forest)')
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Saved feature importance plot to feature_importance.png")

# ============================================================================
# SHAP EXPLANATIONS
# ============================================================================
print("\n[6/8] Setting up SHAP explainer for on-demand predictions...")

# Use TreeExplainer for Random Forest (much faster than KernelExplainer)
explainer = shap.TreeExplainer(rf_model)
print("✓ SHAP TreeExplainer initialized")

# Save SHAP explainer for use in the API
with open('shap_explainer.pkl', 'wb') as f:
    pickle.dump(explainer, f)
print("✓ Saved SHAP explainer to shap_explainer.pkl")

# Note: SHAP values will be computed on-demand for each prediction in the API
# This is more efficient than pre-computing them for all test samples

# ============================================================================
# MODEL 2: Linear Regression (for comparison)
# ============================================================================
print("\n[7/8] Training Linear Regression model (for comparison)...")
lr_model = LinearRegression()
lr_model.fit(X_train, y_train)

y_test_pred_lr = lr_model.predict(X_test)

test_r2_lr = r2_score(y_test, y_test_pred_lr)
test_mae_lr = mean_absolute_error(y_test, y_test_pred_lr)
test_rmse_lr = np.sqrt(mean_squared_error(y_test, y_test_pred_lr))

print(f"\n  📊 LINEAR REGRESSION PERFORMANCE:")
print(f"     R² Score: {test_r2_lr:.4f}")
print(f"     MAE: ${test_mae_lr:,.2f}")
print(f"     RMSE: ${test_rmse_lr:,.2f}")

# Model comparison
print("\n  📊 MODEL COMPARISON:")
print(f"     Random Forest R²: {test_r2_rf:.4f} vs Linear Regression R²: {test_r2_lr:.4f}")
if test_r2_rf > test_r2_lr:
    print(f"     ✓ Random Forest performs better (Δ R² = +{test_r2_rf - test_r2_lr:.4f})")
else:
    print(f"     ⚠️  Linear Regression performs better (Δ R² = +{test_r2_lr - test_r2_rf:.4f})")

# ============================================================================
# MANUAL VERIFICATION - Test 10 predictions
# ============================================================================
print("\n[8/8] Manual verification - Testing 10 sample predictions...")

# Select 10 diverse samples for manual verification
verification_indices = [0, 1000, 5000, 10000, 15000, 20000, 30000, 40000, 45000, 49000]
verification_results = []

print("\n  Prediction Verification:")
print("  " + "-"*78)

for i, idx in enumerate(verification_indices, 1):
    actual = y_test.iloc[idx]
    predicted = y_test_pred_rf[idx]
    error = predicted - actual
    error_pct = (error / actual) * 100
    
    verification_results.append({
        'test_idx': idx,
        'actual_salary': float(actual),
        'predicted_salary': float(predicted),
        'error': float(error),
        'error_pct': float(error_pct)
    })
    
    print(f"\n  [{i}/10] Test Sample #{idx}:")
    print(f"    Actual: ${actual:,.0f}  |  Predicted: ${predicted:,.0f}  |  Error: ${error:+,.0f} ({error_pct:+.1f}%)")

# Save verification results
with open('verification_results.json', 'w') as f:
    json.dump(verification_results, f, indent=2)
print("\n✓ Saved verification results to verification_results.json")

# ============================================================================
# SAVE FINAL MODEL
# ============================================================================
print("\n[SAVING] Saving trained model and artifacts...")

# Save Random Forest model
with open('salary_model_rf.pkl', 'wb') as f:
    pickle.dump(rf_model, f)
print("✓ Saved Random Forest model to salary_model_rf.pkl")

# Save Linear Regression model
with open('salary_model_lr.pkl', 'wb') as f:
    pickle.dump(lr_model, f)
print("✓ Saved Linear Regression model to salary_model_lr.pkl")

# Save model performance metrics
model_metrics = {
    'random_forest': {
        'train': {
            'r2_score': float(train_r2_rf),
            'mae': float(train_mae_rf),
            'rmse': float(train_rmse_rf),
            'mape': float(train_mape_rf)
        },
        'test': {
            'r2_score': float(test_r2_rf),
            'mae': float(test_mae_rf),
            'rmse': float(test_rmse_rf),
            'mape': float(test_mape_rf)
        }
    },
    'linear_regression': {
        'test': {
            'r2_score': float(test_r2_lr),
            'mae': float(test_mae_lr),
            'rmse': float(test_rmse_lr)
        }
    },
    'success_criteria': {
        'r2_threshold': 0.85,
        'mae_threshold': 10000,
        'r2_met': test_r2_rf >= 0.85,
        'mae_met': test_mae_rf <= 10000,
        'all_criteria_met': (test_r2_rf >= 0.85) and (test_mae_rf <= 10000)
    }
}

with open('model_metrics.json', 'w') as f:
    json.dump(model_metrics, f, indent=2)
print("✓ Saved model metrics to model_metrics.json")

# Create prediction examples for documentation
examples = []
for idx in verification_indices[:5]:
    actual = y_test.iloc[idx]
    predicted = y_test_pred_rf[idx]
    
    examples.append({
        'input': X_test.iloc[idx].to_dict(),
        'actual_salary': float(actual),
        'predicted_salary': float(predicted)
    })

with open('prediction_examples.json', 'w') as f:
    json.dump(examples, f, indent=2)
print("✓ Saved prediction examples to prediction_examples.json")

print("\n" + "="*80)
print("PHASE 3 COMPLETE - MODEL TRAINING & EVALUATION")
print("="*80)

print(f"\n📊 FINAL MODEL PERFORMANCE:")
print(f"   Model: Random Forest Regressor")
print(f"   Test R² Score: {test_r2_rf:.4f}")
print(f"   Test MAE: ${test_mae_rf:,.2f}")
print(f"   Test RMSE: ${test_rmse_rf:,.2f}")
print(f"   Test MAPE: {test_mape_rf:.2f}%")

if model_metrics['success_criteria']['all_criteria_met']:
    print(f"\n✅ SUCCESS CRITERIA: ALL MET")
else:
    print(f"\n⚠️  SUCCESS CRITERIA: REVIEW REQUIRED")

print(f"\n📁 FILES CREATED:")
print(f"   • salary_model_rf.pkl - Primary model")
print(f"   • salary_model_lr.pkl - Comparison model")
print(f"   • shap_explainer.pkl - SHAP explainer (for on-demand calculations)")
print(f"   • model_metrics.json - Performance metrics")
print(f"   • feature_importance.csv - Feature rankings")
print(f"   • feature_importance.png - Visualization")
print(f"   • verification_results.json - 10 test predictions")
print(f"   • prediction_examples.json - Example inputs/outputs")

print(f"\n🎯 NEXT STEP: Review metrics, then proceed to Phase 4 (Web App Development)")
print("="*80)
