# Deploy Backend to Render.com (Free Tier)

## Step-by-Step Instructions

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub (easiest)

### 2. Prepare GitHub Repo
You have two options:

#### Option A: Use Existing Repo (Recommended)
```bash
cd /home/azureuser/clawd/salaryapp
git clone https://github.com/Maddddddyy/ai-salary-predictor.git temp-repo
cp -r railway-backend/* temp-repo/
cd temp-repo
git add .
git commit -m "Add backend for Render deployment"
git push origin main
```

#### Option B: Create New Repo
1. Go to https://github.com/new
2. Name: `salary-predictor-backend`
3. Create repository
4. Push the railway-backend folder

### 3. Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `ai-salary-predictor`
4. Configure:
   - **Name:** `salary-predictor-api`
   - **Root Directory:** `railway-backend` (if using existing repo) or leave blank
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
5. Click **"Create Web Service"**

### 4. Wait for Deployment
- First deployment takes 5-10 minutes
- Render will show build logs
- You'll get a URL like: `https://salary-predictor-api.onrender.com`

### 5. Update Frontend
Once deployed, update the frontend environment variable:
```bash
cd /home/azureuser/clawd/salaryapp/frontend
vercel env rm NEXT_PUBLIC_API_URL production --yes
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://salary-predictor-api.onrender.com
vercel --prod
```

## Troubleshooting

### Build Fails - Memory
If build fails due to memory, add this to render.yaml:
```yaml
services:
  - type: web
    name: salary-predictor-api
    runtime: python
    buildCommand: pip install --no-cache-dir -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    plan: free
```

### Files Too Large
Render free tier supports up to 512MB. Your backend is 244MB compressed, should work fine.

## Notes
- Free tier sleeps after 15 mins of inactivity
- First request after sleep takes ~30-60 seconds (cold start)
- For always-on, upgrade to paid tier ($7/month)
