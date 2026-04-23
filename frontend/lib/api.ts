const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SalaryInput {
  job_title: string;
  experience_years: number;
  education_level: string;
  skills_count: number;
  industry: string;
  company_size: string;
  location: string;
  remote_work: string;
  certifications: number;
}

export interface FeatureContribution {
  feature: string;
  value: number;
  shap_value: number;
  contribution_pct: number;
}

export interface SalaryPrediction {
  predicted_salary: number;
  predicted_salary_formatted: string;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  model_confidence: number;
  feature_contributions: FeatureContribution[];
  explanation: string;
  input_summary: SalaryInput;
}

export interface CategoricalOptions {
  job_title: string[];
  education_level: string[];
  industry: string[];
  company_size: string[];
  location: string[];
  remote_work: string[];
}

export async function fetchOptions(): Promise<CategoricalOptions> {
  const response = await fetch(`${API_BASE_URL}/api/options`);
  if (!response.ok) {
    throw new Error('Failed to fetch options');
  }
  return response.json();
}

export async function predictSalary(input: SalaryInput): Promise<SalaryPrediction> {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to predict salary');
  }

  return response.json();
}
