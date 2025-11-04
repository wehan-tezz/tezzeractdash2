# 🚀 Quick Start: Twitter Posting

## 3-Minute Setup Guide

### Step 1: Update Twitter App (2 minutes)

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Click your app → **Settings** → **User authentication settings**
3. Click **"Edit"**
4. Change **App permissions** to: **"Read and write"** ✅
5. Click **"Save"**

### Step 2: Reconnect Twitter (30 seconds)

1. Open your app: `http://localhost:3000/setup`
2. Find **Twitter/X** card
3. Click **"Disconnect"** (if already connected)
4. Click **"Connect"**
5. Authorize the app (note the **Write tweets** permission!)

### Step 3: Test Posting (30 seconds)

**Option A: Test Page**
1. Open: `http://localhost:3000/test-twitter-posting.html`
2. Click **"Load from localStorage"**
3. Type a tweet
4. Click **"Post Tweet"**
5. Check your Twitter! 🎉

**Option B: Browser Console**
```javascript
// Paste this in browser console
const tokens = JSON.parse(localStorage.getItem('twitter_tokens'));
fetch('/api/integrations/twitter/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_token: tokens.access_token,
    text: 'Hello from TezzeractDash! 🚀 #FirstTweet'
  })
}).then(r => r.json()).then(console.log);
```

## ✅ That's It!

You can now post tweets programmatically from your app.

## 📝 Code Example

```typescript
import { getToken } from '@/lib/token-manager';

async function postTweet(text: string) {
  const tokens = getToken('twitter_tokens');
  
  if (!tokens) {
    throw new Error('Twitter not connected');
  }

  const response = await fetch('/api/integrations/twitter/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: tokens.access_token,
      text: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to post tweet');
  }

  return await response.json();
}

// Usage
postTweet('My first automated tweet! 🎉')
  .then(data => console.log('Posted:', data.tweet))
  .catch(err => console.error('Error:', err));
```

## ⚠️ Important

- **Character limit:** 280 characters
- **Rate limit:** 300 tweets per 3 hours
- **Token expires:** After 2 hours (auto-disconnect implemented)

## 🐛 Troubleshooting

**Error: "Forbidden"**
→ Your Twitter app needs "Read and write" permissions (see Step 1)

**Error: "Invalid token"**
→ Reconnect Twitter in the app (see Step 2)

**Error: "Tweet exceeds 280 characters"**
→ Shorten your tweet text

## 📚 Full Documentation

- `TWITTER_POSTING_SETUP.md` - Complete setup guide
- `TWITTER_AND_META_SETUP_COMPLETE.md` - All changes summary

---

**Ready to tweet! 🐦✨**

