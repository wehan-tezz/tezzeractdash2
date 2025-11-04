# 📺 YouTube Analytics Integration Setup

## ✨ What's Been Added

Your dashboard now supports **YouTube Analytics**! You can connect your YouTube channel to:
- Track video views and watch time
- Monitor subscriber growth
- See engagement (likes, comments, shares)
- View daily performance trends
- Integrate with other platforms in unified dashboard

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable YouTube APIs in Google Cloud Console

1. **Go to** [Google Cloud Console](https://console.cloud.google.com/)

2. **Select your project** (the same one you use for Google Analytics)

3. **Enable these APIs:**
   - Go to **"APIs & Services"** → **"Library"**
   - Search for and enable:
     - ✅ **YouTube Data API v3**
     - ✅ **YouTube Analytics API**

4. **That's it!** You're using the same OAuth credentials as Google Analytics

### Step 2: Connect YouTube from Dashboard

1. **Go to Setup page** (`/setup`)

2. **Click "Connect"** on the YouTube Analytics card

3. **Authorize access** - You'll be asked to:
   - Allow access to your YouTube channel
   - Allow access to YouTube Analytics data

4. **Done!** Your YouTube data will start appearing in the dashboard

---

## 📊 What Data Is Collected

### YouTube Metrics

| Metric | Description |
|--------|-------------|
| **Views** | Total video views |
| **Watch Time** | Total minutes watched |
| **Subscribers** | Total channel subscribers |
| **Subscriber Growth** | New subscribers gained/lost |
| **Engagement** | Likes + Comments + Shares |
| **Videos** | Total number of videos |

### Dashboard Integration

- **Performance Trends Chart** - Daily views and engagement
- **Platform Metrics** - YouTube alongside Google Analytics, Twitter, etc.
- **AI Insights** - Personalized recommendations based on YouTube performance
- **Time Ranges** - Today, 7 days, 30 days, 90 days

---

## 🎯 Features Implemented

### 1. YouTube Integration Class
- **File**: `src/lib/integrations/youtube-integration.ts`
- Handles YouTube Data API and YouTube Analytics API calls
- Fetches channel statistics and daily analytics
- Automatic token refresh

### 2. YouTube Data API Route
- **Endpoint**: `/api/integrations/youtube/data`
- Returns metrics and daily breakdown
- Supports all time ranges (7d, 30d, 90d)

### 3. Setup Page Integration
- YouTube card in Platform Connections
- Connection status tracking
- Disconnect functionality
- Red YouTube branding

### 4. Dashboard Integration
- Fetches YouTube data alongside other platforms
- Includes in performance trends chart
- Shows in platform metrics cards
- Combines with other platform data in AI insights

---

## 🔧 Technical Details

### OAuth Scopes Required

```
https://www.googleapis.com/auth/youtube.readonly
https://www.googleapis.com/auth/yt-analytics.readonly
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/userinfo.email
```

### API Endpoints Used

1. **YouTube Data API v3**
   - `GET /youtube/v3/channels` - Channel info and statistics
   
2. **YouTube Analytics API**
   - `GET /youtubeanalytics/v2/reports` - Analytics data with dimensions

### localStorage Keys

- `youtube_tokens` - Access and refresh tokens
- Connected status checked in `connectedPlatforms.youtube`

---

## ✅ Testing Your Integration

1. **Connect YouTube**
   - Go to Setup → Click "Connect" on YouTube card
   - Authorize access
   - Verify "Connected" badge appears

2. **Check Dashboard**
   - Go to Dashboard
   - Should see YouTube in platform metrics
   - Performance trends chart should include YouTube data
   - AI insights should mention YouTube

3. **Test Disconnect**
   - Go to Setup
   - Click red "Disconnect" button on YouTube
   - Verify data no longer appears in dashboard
   - Reconnect to restore

---

## 🎨 What You'll See

### Setup Page
```
┌─────────────────────────────────────┐
│  📺 YouTube Analytics               │
│  Track your YouTube channel performance
│                                     │
│  🟢 Connected                       │
│  [Disconnect]                       │
└─────────────────────────────────────┘
```

### Dashboard
```
Platform Metrics:
┌──────────────┐  ┌──────────────┐
│ Google Analytics  │ YouTube      │
│ 10K Sessions  │  5K Views    │
│ +12.5%       │  +8.3%       │
└──────────────┘  └──────────────┘

Performance Trends:
📈 Chart showing combined data from all platforms
   Including YouTube views and engagement
```

---

## 🆘 Troubleshooting

### "Failed to fetch YouTube channel"
- **Cause**: You don't have a YouTube channel
- **Solution**: Create a YouTube channel first

### "No YouTube channel found"
- **Cause**: OAuth didn't include YouTube scopes
- **Solution**: Disconnect and reconnect YouTube

### API errors (403, 404)
- **Cause**: APIs not enabled in Google Cloud Console
- **Solution**: Enable YouTube Data API v3 and YouTube Analytics API

### Data not showing
- **Cause**: No recent activity or channel is new
- **Solution**: Wait for data to accumulate, or check older date ranges

---

## 🎉 You're All Set!

Your YouTube Analytics integration is ready to go! Just enable the APIs in Google Cloud Console and click "Connect" in your dashboard.

**Questions?** Check the console logs for detailed debugging information, or reach out for support!

