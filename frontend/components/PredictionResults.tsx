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
    <div className="space-y-6 animate-fadeIn">
      {/* Main Prediction Card */}
      <div className="relative backdrop-blur-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden group hover:shadow-purple-500/30 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="text-3xl animate-bounce">💎</div>
          </div>
          <h2 className="text-lg font-medium text-purple-200 mb-2">Your Predicted Annual Salary</h2>
          <div className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 mb-6 animate-pulse">
            {prediction.predicted_salary_formatted}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-200">
            <div className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
              <span className="font-semibold">Range:</span>
              <span>{formatCurrency(prediction.confidence_interval_lower)} - {formatCurrency(prediction.confidence_interval_upper)}</span>
            </div>
            <div className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
              <span className="font-semibold">Confidence:</span>
              <span className="text-green-300">{prediction.model_confidence.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Interval Bar */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h3 className="text-lg font-bold text-white">Salary Range (95% Confidence)</h3>
        </div>
        <div className="relative h-14 bg-white/10 rounded-full overflow-hidden border border-white/20">
          <div 
            className="absolute h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 flex items-center justify-center shadow-lg transition-all duration-500 hover:shadow-purple-500/50"
            style={{
              left: `${((prediction.confidence_interval_lower / prediction.confidence_interval_upper) * 100) - 10}%`,
              width: `${((prediction.predicted_salary - prediction.confidence_interval_lower) / prediction.confidence_interval_upper) * 100 + 20}%`,
            }}
          >
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {prediction.predicted_salary_formatted}
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-3 text-sm text-gray-300">
          <span className="font-semibold">{formatCurrency(prediction.confidence_interval_lower)}</span>
          <span className="font-semibold">{formatCurrency(prediction.confidence_interval_upper)}</span>
        </div>
      </div>

      {/* Feature Contributions Chart */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <span className="text-xl">🎯</span>
          </div>
          <h3 className="text-lg font-bold text-white">Top Factors Affecting Your Salary</h3>
        </div>
        <div className="h-80 backdrop-blur-sm bg-white/5 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis type="number" stroke="#d1d5db" />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#d1d5db"
                tick={{ fontSize: 12, fill: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Impact']}
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  color: '#fff'
                }}
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
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-200">Positive Impact</span>
          </div>
          <div className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-200">Negative Impact</span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <h3 className="text-lg font-bold text-white">AI Explanation</h3>
        </div>
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-5">
          <p className="text-gray-200 leading-relaxed whitespace-pre-line">
            {prediction.explanation}
          </p>
        </div>
      </div>

      {/* Input Summary */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <h3 className="text-lg font-bold text-white">Your Profile Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Job Title', value: prediction.input_summary.job_title, icon: '💼' },
            { label: 'Experience', value: `${prediction.input_summary.experience_years} years`, icon: '📅' },
            { label: 'Education', value: prediction.input_summary.education_level, icon: '🎓' },
            { label: 'Industry', value: prediction.input_summary.industry, icon: '🏢' },
            { label: 'Company Size', value: prediction.input_summary.company_size, icon: '🏭' },
            { label: 'Location', value: prediction.input_summary.location, icon: '🌍' },
            { label: 'Remote Work', value: prediction.input_summary.remote_work, icon: '🏠' },
            { label: 'Skills', value: prediction.input_summary.skills_count, icon: '🛠️' },
            { label: 'Certifications', value: prediction.input_summary.certifications, icon: '🏆' },
          ].map((item, index) => (
            <div 
              key={index}
              className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs text-gray-300 font-medium">{item.label}</span>
              </div>
              <p className="font-bold text-white text-lg">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
