# 💰 AI Salary Predictor

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)
![Python](https://img.shields.io/badge/Python-3.12+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)
![License](https://img.shields.io/badge/license-MIT-green)

A full-stack AI-powered salary prediction application with **96.56% accuracy** using machine learning. Built with Next.js 15, FastAPI, and Random Forest ML model.

## 🎯 Features

- **High Accuracy Predictions**: 96.56% R² score on test data
- **Explainable AI**: SHAP values show which factors impact your salary
- **Interactive UI**: Modern, responsive design with real-time predictions
- **Confidence Intervals**: 95% confidence range for predictions
- **Feature Analysis**: Visual breakdown of salary drivers
- **Production Ready**: Optimized for deployment on Vercel

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React** with modern hooks

### Backend
- **FastAPI** (Python)
- **scikit-learn** (Random Forest Regressor)
- **SHAP** for explainable AI
- **Pandas** & **NumPy** for data processing

### ML Model
- **Random Forest Regressor**
- **96.56% R² score** on test data
- Trained on **200,000+ salary records**
- **9 input features** with engineered features

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to project root
cd salaryapp

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pandas numpy scikit-learn shap

# Start the API server
cd backend
python main.py
# Server runs on http://localhost:8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:3000
```

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| R² Score | 96.56% |
| Training Samples | 200,000 |
| Test Samples | 50,000 |
| Features | 9 core + engineered |

## 🎨 Features Breakdown

### Input Features
1. **Job Title** - 12 tech roles (AI Engineer, Data Scientist, etc.)
2. **Experience Years** - 0-50 years
3. **Education Level** - High School to PhD
4. **Skills Count** - 1-20 technical skills
5. **Industry** - 10 industries (Tech, Finance, Healthcare, etc.)
6. **Company Size** - Startup to Enterprise
7. **Location** - 10 countries/regions
8. **Remote Work** - Yes/No/Hybrid
9. **Certifications** - 0-10 professional certifications

### Output
- **Predicted Salary** - Annual salary in USD
- **Confidence Interval** - 95% confidence range
- **Feature Contributions** - SHAP values showing impact of each factor
- **AI Explanation** - Human-readable breakdown

## 🎯 API Endpoints

### `GET /`
Health check endpoint

### `GET /api/options`
Returns all available dropdown options for the form

### `POST /api/predict`
Predicts salary based on input features

**Request Body:**
```json
{
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
```

**Response:**
```json
{
  "predicted_salary": 145000,
  "predicted_salary_formatted": "$145,000",
  "confidence_interval_lower": 138000,
  "confidence_interval_upper": 152000,
  "model_confidence": 94.5,
  "feature_contributions": [...],
  "explanation": "Based on your profile...",
  "input_summary": {...}
}
```

### `GET /api/stats`
Returns model statistics and performance metrics

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Frontend
```bash
cd frontend
vercel deploy --prod
```

#### Backend Options

**Option 1: Vercel Serverless Function** (Recommended for small-scale)
- Convert `backend/main.py` to Vercel serverless function
- Add `vercel.json` configuration
- Note: Model files must be <50MB (Vercel limit)

**Option 2: Separate Backend Hosting**
- Deploy backend to Railway, Render, or AWS
- Update `NEXT_PUBLIC_API_URL` in frontend `.env`

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 📁 Project Structure

```
salaryapp/
├── backend/
│   └── main.py                 # FastAPI server
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── SalaryForm.tsx     # Input form
│   │   └── PredictionResults.tsx  # Results display
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utilities
│   └── package.json
├── salary_model_rf.pkl         # Trained model
├── preprocessing_info.pkl      # Preprocessing artifacts
├── shap_explainer.pkl          # SHAP explainer
├── categorical_values.json     # Dropdown options
├── feature_names.json          # Feature list
└── model_metrics.json          # Performance metrics
```

## 🧪 Testing

### Backend Testing
```bash
# Test API health
curl http://localhost:8000

# Test options endpoint
curl http://localhost:8000/api/options

# Test prediction
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Data Scientist",
    "experience_years": 5,
    "education_level": "Master",
    "skills_count": 10,
    "industry": "Technology",
    "company_size": "Large",
    "location": "USA",
    "remote_work": "Hybrid",
    "certifications": 2
  }'
```

### Frontend Testing
- Fill out form with various inputs
- Verify predictions display correctly
- Check responsive design on mobile
- Test error handling (invalid inputs, backend down)

## 🎓 Model Training

The model was trained using:
- **Algorithm**: Random Forest Regressor
- **Training Data**: 200,000 synthetic salary records
- **Features**: 9 core features + one-hot encoded categorical variables
- **Preprocessing**: StandardScaler for numerical features, ordinal encoding for education/company size
- **Hyperparameters**: 
  - n_estimators: 100
  - max_depth: 20
  - min_samples_split: 5
  - random_state: 42

## 🔒 Security Notes

- API currently allows all CORS origins (`*`) - restrict in production
- No authentication implemented - add if needed for production
- Model files are excluded from git (too large) - use Git LFS if sharing
- Environment variables should never be committed

## 🐛 Known Issues / Future Improvements

- [ ] Add user authentication
- [ ] Implement rate limiting
- [ ] Add model versioning
- [ ] Create admin dashboard for model retraining
- [ ] Add more job titles and industries
- [ ] Multi-currency support
- [ ] Historical salary trends

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Contact

For questions or feedback, open an issue on GitHub.

## 🙏 Acknowledgments

- Trained using synthetic salary data generated for ML demonstration
- SHAP library for explainable AI
- Next.js and FastAPI communities

---

**Built with ❤️ using Next.js 15, FastAPI, and Machine Learning**
