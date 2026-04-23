"use client";

import { useState } from 'react';
import SalaryForm from '@/components/SalaryForm';
import PredictionResults from '@/components/PredictionResults';
import type { SalaryPrediction } from '@/lib/api';

export default function Home() {
  const [prediction, setPrediction] = useState<SalaryPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              💰 AI Salary Predictor
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Get accurate salary predictions powered by machine learning (96.56% accuracy)
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Enter Your Details
              </h2>
              <SalaryForm 
                onPrediction={setPrediction} 
                onLoading={setLoading}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Analyzing your profile...</p>
              </div>
            )}

            {!loading && !prediction && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to discover your worth?
                </h3>
                <p className="text-gray-600">
                  Fill in your details and click "Predict Salary" to get your personalized salary estimate
                </p>
              </div>
            )}

            {!loading && prediction && (
              <PredictionResults prediction={prediction} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Powered by Random Forest ML Model | Built with Next.js 15 & FastAPI</p>
            <p className="mt-1">Model Accuracy: 96.56% R² | Trained on 200K+ salary data points</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
