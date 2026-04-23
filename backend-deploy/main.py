"""
Salary Prediction API - FastAPI Backend
Zero Error Tolerance - Production Ready
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import pickle
import pandas as pd
import numpy as np
import json
import os
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="Salary Prediction API",
    description="AI-powered salary prediction with explainable results",
    version="1.0.0"
)

# CORS middleware - allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and preprocessing artifacts
BASE_DIR = Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / "salary_model_rf.pkl"
SCALER_PATH = BASE_DIR / "preprocessing_info.pkl"
SHAP_PATH = BASE_DIR / "shap_explainer.pkl"
CATEGORICAL_VALUES_PATH = BASE_DIR / "categorical_values.json"
FEATURE_NAMES_PATH = BASE_DIR / "feature_names.json"

# Load at startup
model = None
preprocessing_info = None
shap_explainer = None
categorical_values = None
feature_names = None
education_order = None
company_size_order = None

@app.on_event("startup")
async def load_model():
    """Load model and artifacts on startup"""
    global model, preprocessing_info, shap_explainer, categorical_values, feature_names
    global education_order, company_size_order
    
    print("Loading model and artifacts...")
    
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print(f"✓ Model loaded from {MODEL_PATH}")
    
    with open(SCALER_PATH, 'rb') as f:
        preprocessing_info = pickle.load(f)
    print(f"✓ Preprocessing info loaded from {SCALER_PATH}")
    
    with open(SHAP_PATH, 'rb') as f:
        shap_explainer = pickle.load(f)
    print(f"✓ SHAP explainer loaded from {SHAP_PATH}")
    
    with open(CATEGORICAL_VALUES_PATH, 'r') as f:
        categorical_values = json.load(f)
    print(f"✓ Categorical values loaded from {CATEGORICAL_VALUES_PATH}")
    
    with open(FEATURE_NAMES_PATH, 'r') as f:
        feature_names = json.load(f)
    print(f"✓ Feature names loaded ({len(feature_names)} features)")
    
    education_order = preprocessing_info['education_order']
    company_size_order = preprocessing_info['company_size_order']
    
    print("✅ All artifacts loaded successfully")

# Request/Response models
class SalaryInput(BaseModel):
    job_title: str = Field(..., description="Job title")
    experience_years: int = Field(..., ge=0, le=50, description="Years of experience (0-50)")
    education_level: str = Field(..., description="Education level")
    skills_count: int = Field(..., ge=1, le=20, description="Number of skills (1-20)")
    industry: str = Field(..., description="Industry")
    company_size: str = Field(..., description="Company size")
    location: str = Field(..., description="Location")
    remote_work: str = Field(..., description="Remote work option (Yes/No/Hybrid)")
    certifications: int = Field(..., ge=0, le=10, description="Number of certifications (0-10)")
    
    class Config:
        schema_extra = {
            "example": {
                "job_title": "AI Engineer",
                "experience_years": 5,
                "education_level": "Master",
                "skills_count": 12,
                "industry": "Technology",
                "company_size": "Large",
                "location": "USA",
                "remote_work": "Hybrid",
                "certifications": 3
            }
        }

class FeatureContribution(BaseModel):
    feature: str
    value: float
    shap_value: float
    contribution_pct: float

class SalaryPrediction(BaseModel):
    predicted_salary: float
    predicted_salary_formatted: str
    confidence_interval_lower: float
    confidence_interval_upper: float
    model_confidence: float
    feature_contributions: List[FeatureContribution]
    explanation: str
    input_summary: Dict

def preprocess_input(data: SalaryInput) -> pd.DataFrame:
    """
    Convert input data to the format expected by the model
    """
    # Create initial dataframe with raw input
    input_dict = {
        'job_title': data.job_title,
        'experience_years': data.experience_years,
        'education_level': data.education_level,
        'skills_count': data.skills_count,
        'industry': data.industry,
        'company_size': data.company_size,
        'location': data.location,
        'remote_work': data.remote_work,
        'certifications': data.certifications
    }
    
    df = pd.DataFrame([input_dict])
    
    # Apply ordinal encoding
    df['education_level_encoded'] = df['education_level'].map(education_order)
    df['company_size_encoded'] = df['company_size'].map(company_size_order)
    
    # One-hot encoding for nominal features
    nominal_features = ['job_title', 'industry', 'location', 'remote_work']
    df = pd.get_dummies(df, columns=nominal_features, prefix=nominal_features)
    
    # Drop original categorical columns
    df = df.drop(['education_level', 'company_size'], axis=1)
    
    # Ensure all feature columns exist (same as training data)
    for col in feature_names:
        if col not in df.columns:
            df[col] = 0
    
    # Reorder columns to match training data
    df = df[feature_names]
    
    # Apply scaling to numerical features
    scaler = preprocessing_info['scaler']
    numerical_indices = preprocessing_info['numerical_indices']
    
    df_array = df.values
    df_array[:, numerical_indices] = scaler.transform(df_array[:, numerical_indices])
    
    df_scaled = pd.DataFrame(df_array, columns=feature_names)
    
    return df_scaled

def generate_explanation(data: SalaryInput, prediction: float, contributions: List[Dict]) -> str:
    """
    Generate a human-readable explanation of the prediction
    """
    top_positive = [c for c in contributions if c['shap_value'] > 0][:3]
    top_negative = [c for c in contributions if c['shap_value'] < 0][:3]
    
    explanation = f"Based on your profile as a {data.job_title} with {data.experience_years} years of experience"
    explanation += f" and a {data.education_level} degree, your predicted salary is ${prediction:,.0f}.\n\n"
    
    if top_positive:
        explanation += "Factors increasing your salary:\n"
        for c in top_positive:
            feature_name = c['feature'].replace('_', ' ').title()
            explanation += f"  • {feature_name}: +${abs(c['shap_value']):,.0f}\n"
    
    if top_negative:
        explanation += "\nFactors decreasing your salary:\n"
        for c in top_negative:
            feature_name = c['feature'].replace('_', ' ').title()
            explanation += f"  • {feature_name}: -${abs(c['shap_value']):,.0f}\n"
    
    return explanation.strip()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Salary Prediction API",
        "version": "1.0.0",
        "model_loaded": model is not None
    }

@app.get("/api/options")
async def get_options():
    """Get all available options for dropdowns"""
    return categorical_values

@app.post("/api/predict", response_model=SalaryPrediction)
async def predict_salary(data: SalaryInput):
    """
    Predict salary based on input features with explainability
    """
    try:
        # Validate inputs
        if data.job_title not in categorical_values['job_title']:
            raise HTTPException(status_code=400, detail=f"Invalid job_title: {data.job_title}")
        if data.education_level not in categorical_values['education_level']:
            raise HTTPException(status_code=400, detail=f"Invalid education_level: {data.education_level}")
        if data.industry not in categorical_values['industry']:
            raise HTTPException(status_code=400, detail=f"Invalid industry: {data.industry}")
        if data.company_size not in categorical_values['company_size']:
            raise HTTPException(status_code=400, detail=f"Invalid company_size: {data.company_size}")
        if data.location not in categorical_values['location']:
            raise HTTPException(status_code=400, detail=f"Invalid location: {data.location}")
        if data.remote_work not in categorical_values['remote_work']:
            raise HTTPException(status_code=400, detail=f"Invalid remote_work: {data.remote_work}")
        
        # Preprocess input
        X = preprocess_input(data)
        
        # Make prediction
        prediction = model.predict(X)[0]
        
        # Calculate confidence interval (using model's prediction variance)
        # For Random Forest, we can use individual tree predictions
        tree_predictions = np.array([tree.predict(X)[0] for tree in model.estimators_])
        std_dev = np.std(tree_predictions)
        ci_lower = prediction - 1.96 * std_dev  # 95% confidence interval
        ci_upper = prediction + 1.96 * std_dev
        
        # Model confidence (inverse of coefficient of variation)
        confidence = max(0, min(100, 100 * (1 - std_dev / prediction)))
        
        # Calculate SHAP values for explanation
        shap_values = shap_explainer.shap_values(X)
        
        # Get feature contributions
        contributions = []
        for i, feature in enumerate(feature_names):
            shap_val = shap_values[0][i]
            if abs(shap_val) > 0.01:  # Only include significant contributions
                contributions.append({
                    'feature': feature,
                    'value': float(X.iloc[0, i]),
                    'shap_value': float(shap_val),
                    'contribution_pct': float((shap_val / prediction) * 100) if prediction != 0 else 0
                })
        
        # Sort by absolute SHAP value
        contributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        # Generate explanation
        explanation = generate_explanation(data, prediction, contributions)
        
        # Format response
        response = SalaryPrediction(
            predicted_salary=float(prediction),
            predicted_salary_formatted=f"${prediction:,.0f}",
            confidence_interval_lower=float(max(0, ci_lower)),
            confidence_interval_upper=float(ci_upper),
            model_confidence=float(confidence),
            feature_contributions=[FeatureContribution(**c) for c in contributions[:10]],  # Top 10
            explanation=explanation,
            input_summary=data.dict()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    """Get model statistics"""
    with open(BASE_DIR / "model_metrics.json", 'r') as f:
        metrics = json.load(f)
    
    return {
        "model_type": "Random Forest Regressor",
        "training_samples": 200000,
        "test_samples": 50000,
        "performance": metrics['random_forest']['test'],
        "features_count": len(feature_names)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
