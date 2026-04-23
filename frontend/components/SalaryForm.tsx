"use client";

import { useState, useEffect } from 'react';
import { fetchOptions, predictSalary, type SalaryInput, type CategoricalOptions } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SalaryFormProps {
  onPrediction: (result: any) => void;
  onLoading: (loading: boolean) => void;
}

export default function SalaryForm({ onPrediction, onLoading }: SalaryFormProps) {
  const [options, setOptions] = useState<CategoricalOptions | null>(null);
  const [formData, setFormData] = useState<SalaryInput>({
    job_title: '',
    experience_years: 5,
    education_level: '',
    skills_count: 8,
    industry: '',
    company_size: '',
    location: '',
    remote_work: '',
    certifications: 2,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch dropdown options on mount
    fetchOptions()
      .then(data => {
        setOptions(data);
        // Set default values
        setFormData(prev => ({
          ...prev,
          job_title: data.job_title[0] || '',
          education_level: data.education_level[0] || '',
          industry: data.industry[0] || '',
          company_size: data.company_size[0] || '',
          location: data.location[0] || '',
          remote_work: data.remote_work[0] || '',
        }));
      })
      .catch(err => setError('Failed to load options. Please ensure the backend is running.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    onLoading(true);

    try {
      const result = await predictSalary(formData);
      onPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleInputChange = (field: keyof SalaryInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!options) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="backdrop-blur-lg bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl animate-shake">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Job Title */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            💼 Job Title
          </label>
          <select
            value={formData.job_title}
            onChange={(e) => handleInputChange('job_title', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          >
            {options.job_title.map(title => (
              <option key={title} value={title} className="bg-slate-800">{title}</option>
            ))}
          </select>
        </div>

        {/* Experience Years */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            📅 Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.experience_years}
            onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          />
        </div>

        {/* Education Level */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            🎓 Education Level
          </label>
          <select
            value={formData.education_level}
            onChange={(e) => handleInputChange('education_level', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          >
            {options.education_level.map(level => (
              <option key={level} value={level} className="bg-slate-800">{level}</option>
            ))}
          </select>
        </div>

        {/* Skills Count */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            🛠️ Number of Skills
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.skills_count}
            onChange={(e) => handleInputChange('skills_count', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          />
        </div>

        {/* Industry */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            🏢 Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          >
            {options.industry.map(ind => (
              <option key={ind} value={ind} className="bg-slate-800">{ind}</option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            🏭 Company Size
          </label>
          <select
            value={formData.company_size}
            onChange={(e) => handleInputChange('company_size', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          >
            {options.company_size.map(size => (
              <option key={size} value={size} className="bg-slate-800">{size}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            🌍 Location
          </label>
          <select
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          >
            {options.location.map(loc => (
              <option key={loc} value={loc} className="bg-slate-800">{loc}</option>
            ))}
          </select>
        </div>

        {/* Remote Work */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            🏠 Remote Work
          </label>
          <select
            value={formData.remote_work}
            onChange={(e) => handleInputChange('remote_work', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          >
            {options.remote_work.map(remote => (
              <option key={remote} value={remote} className="bg-slate-800">{remote}</option>
            ))}
          </select>
        </div>

        {/* Certifications */}
        <div className="md:col-span-2 group">
          <label className="block text-sm font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">
            🏆 Number of Certifications
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={formData.certifications}
            onChange={(e) => handleInputChange('certifications', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm hover:bg-white/[0.15] transition-all"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "relative w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 overflow-hidden group",
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        <span className={cn(
          "absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 transition-opacity duration-300",
          !loading && "group-hover:opacity-100"
        )}></span>
        {loading ? (
          <span className="relative flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Predicting...
          </span>
        ) : (
          <span className="relative flex items-center justify-center gap-2">
            <span>✨</span>
            <span>Predict My Salary</span>
            <span>✨</span>
          </span>
        )}
      </button>
    </form>
  );
}
