"use client";

import { useState } from 'react';
import SalaryForm from '@/components/SalaryForm';
import PredictionResults from '@/components/PredictionResults';
import type { SalaryPrediction } from '@/lib/api';

export default function Home() {
  const [prediction, setPrediction] = useState<SalaryPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative text-5xl">💰</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 mb-3 animate-gradient">
              AI Salary Predictor
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
              Discover your worth with <span className="text-purple-400 font-semibold">96.56% accuracy</span> powered by advanced machine learning
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8 sticky top-8 hover:bg-white/[0.12] transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Your Profile
                </h2>
              </div>
              <SalaryForm 
                onPrediction={setPrediction} 
                onLoading={setLoading}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-400"></div>
                </div>
                <p className="text-white font-semibold text-lg mt-6">Analyzing your profile...</p>
                <p className="text-gray-400 text-sm mt-2">Calculating salary prediction</p>
              </div>
            )}

            {!loading && !prediction && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center hover:bg-white/[0.12] transition-all duration-300">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative text-7xl">📊</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to discover your worth?
                </h3>
                <p className="text-gray-300 max-w-md mx-auto leading-relaxed">
                  Fill in your details and let our AI-powered model predict your personalized salary estimate
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
      <footer className="relative backdrop-blur-sm bg-white/5 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-300 text-sm mb-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Powered by Random Forest ML
              </span>
              <span className="text-gray-600">|</span>
              <span>Built with Next.js 15 & FastAPI</span>
            </div>
            <p className="text-gray-400 text-xs">
              Model Accuracy: <span className="text-purple-400 font-semibold">96.56% R²</span> • Trained on 200K+ data points
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
