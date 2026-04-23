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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <select
            value={formData.job_title}
            onChange={(e) => handleInputChange('job_title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {options.job_title.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        {/* Experience Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.experience_years}
            onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level
          </label>
          <select
            value={formData.education_level}
            onChange={(e) => handleInputChange('education_level', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {options.education_level.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Skills Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Skills
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.skills_count}
            onChange={(e) => handleInputChange('skills_count', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {options.industry.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size
          </label>
          <select
            value={formData.company_size}
            onChange={(e) => handleInputChange('company_size', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {options.company_size.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {options.location.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Remote Work */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remote Work
          </label>
          <select
            value={formData.remote_work}
            onChange={(e) => handleInputChange('remote_work', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {options.remote_work.map(remote => (
              <option key={remote} value={remote}>{remote}</option>
            ))}
          </select>
        </div>

        {/* Certifications */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Certifications
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={formData.certifications}
            onChange={(e) => handleInputChange('certifications', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors",
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Predicting...
          </span>
        ) : (
          'Predict Salary'
        )}
      </button>
    </form>
  );
}
