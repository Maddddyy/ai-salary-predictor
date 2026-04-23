"use client";

import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { SalaryPrediction } from '@/lib/api';

interface PredictionResultsProps {
  prediction: SalaryPrediction;
}

export default function PredictionResults({ prediction }: PredictionResultsProps) {
  // Prepare chart data from feature contributions
  const chartData = prediction.feature_contributions.slice(0, 8).map(fc => ({
    name: fc.feature
      .replace(/_/g, ' ')
      .replace(/^(job title|industry|location|remote work|education level|company size)/, (match) => 
        match.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      )
      .split(' ')
      .slice(0, 3)
      .join(' '),
    impact: Math.round(fc.shap_value),
    percentage: fc.contribution_pct.toFixed(1),
  }));

  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="text-center">
          <h2 className="text-lg font-medium opacity-90 mb-2">Predicted Annual Salary</h2>
          <div className="text-5xl md:text-6xl font-bold mb-4">
            {prediction.predicted_salary_formatted}
          </div>
          <div className="flex items-center justify-center gap-4 text-sm opacity-90">
            <div>
              <span className="font-semibold">Range: </span>
              {formatCurrency(prediction.confidence_interval_lower)} - {formatCurrency(prediction.confidence_interval_upper)}
            </div>
            <div className="hidden md:block">•</div>
            <div>
              <span className="font-semibold">Confidence: </span>
              {prediction.model_confidence.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Interval Bar */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Range (95% Confidence)</h3>
        <div className="relative h-12 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center"
            style={{
              left: `${((prediction.confidence_interval_lower / prediction.confidence_interval_upper) * 100) - 10}%`,
              width: `${((prediction.predicted_salary - prediction.confidence_interval_lower) / prediction.confidence_interval_upper) * 100 + 20}%`,
            }}
          >
            <span className="text-white font-semibold text-sm">
              {prediction.predicted_salary_formatted}
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{formatCurrency(prediction.confidence_interval_lower)}</span>
          <span>{formatCurrency(prediction.confidence_interval_upper)}</span>
        </div>
      </div>

      {/* Feature Contributions Chart */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Factors Affecting Your Salary</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Impact']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="impact" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.impact > 0 ? '#10b981' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Positive Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Negative Impact</span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Explanation</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {prediction.explanation}
          </p>
        </div>
      </div>

      {/* Input Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-600">Job Title:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.job_title}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Experience:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.experience_years} years</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Education:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.education_level}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Industry:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.industry}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Company Size:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.company_size}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Location:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.location}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Remote Work:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.remote_work}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Skills:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.skills_count}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Certifications:</span>
            <p className="font-semibold text-gray-900">{prediction.input_summary.certifications}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
