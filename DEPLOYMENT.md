# Deployment Guide

## ✅ GitHub Repository
**Repository:** https://github.com/Maddddyy/ai-salary-predictor

## 🚀 Deployment Options

### Option 1: Deploy Frontend Only to Vercel (Recommended for Testing)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Set Environment Variable:**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `http://localhost:8000` (for local backend)
   - Or use a deployed backend URL (see Option 2)

### Option 2: Deploy Backend to Railway/Render

#### Railway (Recommended)

1. **Go to:** https://railway.app
2. **Click:** "New Project" → "Deploy from GitHub repo"
3. **Select:** `ai-salary-predictor`
4. **Configure:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variable: `PORT` = `8000`

5. **Note the deployed URL** (e.g., `https://your-app.railway.app`)

6. **Update Frontend:**
   - In Vercel: Set `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app`

#### Render

1. **Go to:** https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Configure:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 3: All-in-One Vercel Deployment

**Note:** Backend as Vercel Serverless Function has limitations:
- Model files must be <50MB
- Cold starts may be slow
- Not recommended for production

1. Create `api/predict.py` in frontend directory
2. Move backend logic to serverless function
3. Deploy entire app to Vercel

## 📦 Model Files for Deployment

**Important:** Model files (*.pkl) are not included in git due to size.

**To deploy backend:**
1. Copy model files to backend server:
   - `salary_model_rf.pkl`
   - `preprocessing_info.pkl`
   - `shap_explainer.pkl`
   - `categorical_values.json`
   - `feature_names.json`

2. Upload via SCP or include in deployment package

## 🔐 Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend
- `PORT` - Server port (usually set by platform)
- `CORS_ORIGINS` - Allowed CORS origins (set to frontend URL)

## ✅ Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured
- [ ] Model files uploaded to backend
- [ ] CORS settings updated in backend
- [ ] Frontend API URL points to deployed backend
- [ ] Test prediction endpoint
- [ ] Test all features end-to-end

## 🧪 Testing Deployed App

1. **Open deployed frontend URL**
2. **Fill in salary prediction form**
3. **Submit and verify:**
   - Prediction displays correctly
   - Chart renders
   - Confidence interval shows
   - Explanation appears
   - No CORS errors in browser console

## 🐛 Troubleshooting

### CORS Errors
- Update `allow_origins` in `backend/main.py` to include your frontend URL
- Redeploy backend

### Model Files Missing
- Ensure all `.pkl` and `.json` files are uploaded to backend server
- Check file paths in backend code

### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running and accessible
- Verify no firewall blocking requests

## 📊 Cost Estimates

### Free Tier Options:
- **Vercel:** Free for personal projects (unlimited deployments)
- **Railway:** $5/month credit (free trial available)
- **Render:** Free tier available (with cold starts)

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:
- Push to `master` branch → Auto-deploy
- Configure via platform dashboard

---

**Ready to deploy?** Start with Option 1 (Vercel frontend + local backend for testing)!
