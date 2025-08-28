# Vercel Blob Storage Setup

This guide explains how to set up Vercel Blob Storage for storing generated artwork and uploaded images.

## 🎯 What Changed

The app now downloads and stores all Fal.ai generated images locally using Vercel Blob Storage instead of relying on external CDN URLs.

### ✅ Benefits:
- **Faster Loading** - Images served from your own domain
- **Better Control** - Full ownership of generated content
- **Reliability** - No dependency on external CDN availability
- **SEO Friendly** - Images hosted on your domain
- **Cost Effective** - Vercel Blob Storage is very affordable

## 🔧 Setup Instructions

### 1. Create Vercel Blob Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob**
3. Click **Create Database** 
4. Choose a name (e.g., "happyhead-images")
5. Select your region (choose closest to your users)

### 2. Get Access Token

1. In your Blob store dashboard, click **Settings**
2. Go to **Access Tokens**
3. Click **Create Token**
4. Choose **Read and Write** permissions
5. Copy the token (starts with `vercel_blob_rw_...`)

### 3. Set Environment Variable

#### For Production (Vercel):
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** Your copied token
   - **Environment:** Production, Preview, Development

#### For Local Development:
1. Update your `.env.local` file:
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

## 📁 Storage Structure

Images are organized in Vercel Blob Storage as:
```
textures/
├── user-uploads/
│   ├── artwork/
│   │   └── user-session-{timestamp}/
│   │       └── artwork_{timestamp}.png
│   └── logos/
│       └── user-session-{timestamp}/
│           └── logo_{timestamp}.{ext}
```

## 🔄 How It Works

### Artwork Generation:
1. User enters prompt → Fal.ai generates image
2. API downloads image from Fal.ai
3. Image uploaded to Vercel Blob Storage
4. Blob Storage URL returned to frontend
5. Image applied to 3D model

### File Uploads:
1. User uploads file → Converted to buffer
2. File uploaded to Vercel Blob Storage
3. Blob Storage URL returned to frontend
4. Image applied to 3D model

## 💰 Pricing

Vercel Blob Storage pricing (as of 2024):
- **Free Tier:** 1GB storage, 100GB bandwidth
- **Pro:** $0.15/GB storage, $0.40/GB bandwidth
- **Enterprise:** Custom pricing

For typical usage, costs are very low (few dollars per month).

## 🚀 Testing

After setup, test by:
1. Generating artwork with AI
2. Uploading custom images
3. Check Vercel Dashboard → Storage → Blob to see stored files

## 🔍 Troubleshooting

### Common Issues:

**"Missing BLOB_READ_WRITE_TOKEN"**
- Ensure environment variable is set correctly
- Check token has read/write permissions

**"Upload failed"**
- Verify token is valid and not expired
- Check Vercel Blob store exists and is active

**"Images not loading"**
- Blob URLs should start with `https://`
- Check blob access is set to 'public'

## 📊 Monitoring

Monitor usage in Vercel Dashboard:
- Storage usage
- Bandwidth consumption
- Request counts
- Error rates
