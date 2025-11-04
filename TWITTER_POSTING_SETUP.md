# Twitter/X Posting Setup Guide

## 🎯 Overview
This guide will help you set up Twitter/X integration to publish posts directly from your dashboard.

## 📋 Prerequisites

1. **Twitter Developer Account** - You need a Twitter Developer account
2. **Twitter App** - Create an app in the Twitter Developer Portal
3. **OAuth 2.0 Setup** - Configure OAuth 2.0 with PKCE

## 🔧 Step 1: Twitter Developer Portal Setup

### 1.1 Create a Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign up for a developer account (if you haven't already)
3. Complete the application process

### 1.2 Create a New App
1. In the Developer Portal, click **"+ Create Project"**
2. Name your project (e.g., "TezzeractDash")
3. Select use case: **"Making a bot"** or **"Exploring the API"**
4. Provide app description
5. Create the app

### 1.3 Configure App Settings

#### User Authentication Settings
1. Go to your app → **"Settings"** → **"User authentication settings"**
2. Click **"Set up"**
3. Configure the following:

**App permissions:**
- ✅ **Read and write** (Required for posting tweets)

**Type of App:**
- ✅ **Web App, Automated App or Bot**

**App info:**
- **Callback URI / Redirect URL:**
  ```
  http://localhost:3000/api/auth/twitter/callback
  ```
  (For production, add your production URL too)

- **Website URL:**
  ```
  http://localhost:3000
  ```
  (Or your production URL)

4. Click **"Save"**

### 1.4 Get Your Credentials

After setup, you'll receive:
- **Client ID** (OAuth 2.0)
- **Client Secret** (OAuth 2.0)

**Important:** Save these credentials securely!

## 🔐 Step 2: Environment Variables

Add these to your `.env.local` file:

```env
# Twitter/X OAuth 2.0 Credentials
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Production:**
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🎨 Step 3: OAuth Scopes

The app now requests these scopes:
- ✅ `tweet.read` - Read tweets
- ✅ `tweet.write` - **Post tweets** (NEW!)
- ✅ `users.read` - Read user profile
- ✅ `offline.access` - Refresh token support

## 🚀 Step 4: Connect Twitter in Your App

### 4.1 Navigate to Setup Page
1. Run your app: `npm run dev`
2. Go to **Digital Setup** page
3. Find **Twitter/X** card

### 4.2 Connect Account
1. Click **"Connect"** button
2. You'll be redirected to Twitter OAuth
3. **Important:** Review the permissions:
   - Read Tweets
   - **Write Tweets** ← This is new!
   - See your profile
4. Click **"Authorize app"**
5. You'll be redirected back to your app

### 4.3 Verify Connection
- Twitter/X card should show as **"Connected"**
- You should see your Twitter username

## 📝 Step 5: Post a Tweet

### Using the API Endpoint

**Endpoint:** `POST /api/integrations/twitter/post`

**Request Body:**
```json
{
  "access_token": "your_access_token",
  "text": "Hello from TezzeractDash! 🚀"
}
```

**Response (Success):**
```json
{
  "success": true,
  "tweet": {
    "id": "1234567890",
    "text": "Hello from TezzeractDash! 🚀",
    "created_at": "2024-11-04T12:00:00.000Z"
  },
  "message": "Tweet posted successfully!"
}
```

### Example: Post from Content Suggestions

```typescript
const postToTwitter = async (content: string) => {
  const tokens = getToken('twitter_tokens');
  
  if (!tokens) {
    alert('Please connect your Twitter account first');
    return;
  }

  try {
    const response = await fetch('/api/integrations/twitter/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: tokens.access_token,
        text: content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post tweet');
    }

    const data = await response.json();
    console.log('Tweet posted:', data.tweet);
    alert('Tweet posted successfully!');
  } catch (error) {
    console.error('Error posting tweet:', error);
    alert('Failed to post tweet: ' + error.message);
  }
};
```

## 🔍 Step 6: Testing

### Test 1: Check Connection
```bash
curl "http://localhost:3000/api/integrations/twitter/post?access_token=YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "can_post": true,
  "user": {
    "id": "123456789",
    "username": "yourhandle",
    "name": "Your Name"
  },
  "message": "Ready to post tweets"
}
```

### Test 2: Post a Tweet
```bash
curl -X POST http://localhost:3000/api/integrations/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "YOUR_TOKEN",
    "text": "Test tweet from API! 🚀"
  }'
```

## ⚠️ Important Notes

### Character Limits
- **Standard tweets:** 280 characters max
- **Twitter Blue/Premium:** Up to 4,000 characters (not yet supported in this version)

### Rate Limits
Twitter has rate limits for posting:
- **User context:** 300 tweets per 3 hours
- **App context:** Varies by tier

### Token Expiration
- Access tokens expire after 2 hours
- Refresh tokens can be used to get new access tokens
- The app automatically handles token expiration

### Permissions Required
Your Twitter app MUST have:
- ✅ **Read and write** permissions
- ✅ OAuth 2.0 enabled
- ✅ Callback URL configured

## 🐛 Troubleshooting

### Error: "Forbidden - Check if your app has tweet.write permissions"
**Solution:**
1. Go to Twitter Developer Portal
2. Your App → Settings → User authentication settings
3. Change permissions to **"Read and write"**
4. Save changes
5. **Disconnect and reconnect** your Twitter account in the app

### Error: "Invalid or expired access token"
**Solution:**
1. The token has expired (2 hours)
2. Disconnect and reconnect Twitter in the app
3. Or implement token refresh (see below)

### Error: "Rate limit exceeded"
**Solution:**
- Wait for the rate limit window to reset
- Twitter allows 300 tweets per 3 hours
- Check [Twitter API Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

### Error: "Tweet text exceeds 280 characters"
**Solution:**
- Shorten your tweet text
- Or split into a thread (not yet implemented)

## 🔄 Token Refresh (Future Enhancement)

To implement automatic token refresh:

```typescript
async function refreshTwitterToken(refreshToken: string) {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  return data;
}
```

## 📚 Additional Resources

- [Twitter API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Twitter OAuth 2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Tweet Creation API](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)
- [Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

## ✅ Checklist

Before posting tweets, ensure:
- [ ] Twitter Developer account created
- [ ] App created with **Read and write** permissions
- [ ] OAuth 2.0 configured with correct callback URL
- [ ] Environment variables set in `.env.local`
- [ ] Twitter account connected in the app
- [ ] `tweet.write` scope included in OAuth request
- [ ] Token is valid (not expired)

## 🎉 Next Steps

1. **Implement in Content Suggestions** - Add "Post to Twitter" button
2. **Schedule Tweets** - Add scheduling functionality
3. **Thread Support** - Post tweet threads
4. **Media Upload** - Support images and videos
5. **Analytics** - Track tweet performance

---

**Need Help?**
- Check the [Twitter Developer Community](https://twittercommunity.com/)
- Review error messages in browser console
- Check server logs for detailed error information

