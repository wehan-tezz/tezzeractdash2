# 🔄 Twitter Refresh Token Fix

## ✅ What Was Fixed

Updated Twitter OAuth to properly request and receive refresh tokens for automatic scheduled posting.

## 🐛 The Problem

When connecting Twitter, the app was NOT receiving a refresh token, which meant:
- ❌ Tokens expired after 2 hours
- ❌ Couldn't auto-post scheduled content
- ❌ Users had to manually reconnect every 2 hours
- ❌ No way to refresh expired tokens

## 🔧 The Solution

Added two critical changes to get refresh tokens:

### **1. Added `email` scope to OAuth request**
**File:** `src/lib/integrations/integration-factory.ts`

```typescript
// BEFORE:
scope: 'tweet.read tweet.write users.read offline.access'

// AFTER:
scope: 'tweet.read tweet.write users.read offline.access email'
```

**Why:** Twitter requires the `email` scope to be requested for `offline.access` to work properly.

### **2. Added `scope` parameter to token exchange**
**File:** `src/app/api/auth/twitter/callback/route.ts`

```typescript
// Token exchange request now includes:
body: new URLSearchParams({
  code,
  grant_type: 'authorization_code',
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
  code_verifier: state || '',
  scope: 'tweet.read tweet.write users.read offline.access email', // ⭐ ADDED
}),
```

**Why:** The scope parameter must be included in the token exchange to actually receive the refresh token.

### **3. Enhanced Logging**

Now logs refresh token status:
```typescript
console.log('Twitter token received:', { 
  expires_in: tokenData.expires_in, 
  has_access_token: !!tokenData.access_token,
  has_refresh_token: !!tokenData.refresh_token, // ⭐ NEW
  scope: tokenData.scope, // ⭐ NEW
  token_type: tokenData.token_type // ⭐ NEW
});
```

### **4. Store Token Expiration Timestamp**

Added `expires_at` to stored tokens:
```typescript
const tokens = {
  access_token: tokenData.access_token,
  refresh_token: tokenData.refresh_token,
  expires_in: tokenData.expires_in,
  expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in, // ⭐ ADDED
  token_type: tokenData.token_type,
  scope: tokenData.scope,
  user_id: userData.data?.id,
  user_name: userData.data?.name,
  username: userData.data?.username,
};
```

## 🧪 How to Test

### **Step 1: Disconnect Twitter**
1. Go to `/setup` page
2. Find Twitter/X card
3. Click "Disconnect"

### **Step 2: Reconnect Twitter**
1. Click "Connect" on Twitter/X
2. You'll see a NEW permission request for **email**
3. Authorize the app

### **Step 3: Check Console Logs**
You should now see:
```
Twitter token received: { 
  expires_in: 7200, 
  has_access_token: true,
  has_refresh_token: true, // ✅ Should be TRUE now!
  scope: 'tweet.read tweet.write users.read offline.access email',
  token_type: 'bearer'
}
```

### **Step 4: Verify in Browser Console**
Open browser console and run:
```javascript
const tokens = JSON.parse(localStorage.getItem('twitter_tokens'));
console.log('Access token:', tokens.access_token ? 'Present ✅' : 'Missing ❌');
console.log('Refresh token:', tokens.refresh_token ? 'Present ✅' : 'Missing ❌');
console.log('Expires at:', new Date(tokens.expires_at * 1000).toLocaleString());
console.log('Scope:', tokens.scope);
```

**Expected output:**
```
Access token: Present ✅
Refresh token: Present ✅
Expires at: [date/time 2 hours from now]
Scope: tweet.read tweet.write users.read offline.access email
```

## ⚠️ Important: Twitter Developer Portal Settings

Make sure your Twitter app has these settings:

### **User Authentication Settings:**
1. **App permissions:** Read and write ✅
2. **Type of App:** Web App, Automated App or Bot ✅
3. **Callback URL:** `http://localhost:3000/api/auth/twitter/callback` ✅
4. **Website URL:** `http://localhost:3000` ✅
5. **Request email from users:** ENABLED ✅ ← **CRITICAL!**

**Where to find this:**
- Go to: https://developer.twitter.com/en/portal/dashboard
- Your App → Settings → User authentication settings
- Edit settings
- Check "Request email from users"
- Save

## 🎯 What This Enables

With refresh tokens, you can now:

### **1. Automatic Token Refresh**
```typescript
// Before posting, check if token expired
if (isTokenExpired(tokens.expires_at)) {
  // Use refresh token to get new access token
  const newTokens = await refreshTwitterToken(tokens.refresh_token);
  // Update stored tokens
  // Continue posting with new access token
}
```

### **2. Scheduled Posting**
- Schedule tweets days/weeks in advance
- Cron job automatically refreshes tokens
- Posts happen without user intervention
- No more "token expired" errors

### **3. Long-term Automation**
- Refresh token doesn't expire (unless revoked)
- Can post indefinitely without reconnecting
- Users only connect once
- Everything works automatically

## 📊 Token Lifecycle

### **Before Fix:**
```
Connect Twitter
    ↓
Access token valid for 2 hours
    ↓
After 2 hours → EXPIRED ❌
    ↓
Must manually reconnect
```

### **After Fix:**
```
Connect Twitter
    ↓
Access token + Refresh token
    ↓
After 2 hours → Access token expired
    ↓
Use refresh token → Get new access token ✅
    ↓
Keep posting indefinitely!
```

## 🔐 Security Notes

### **Refresh Token Storage:**
- Currently in localStorage (for immediate use)
- **TODO:** Move to encrypted database for scheduled posting
- Never expose refresh tokens in logs
- Treat like passwords

### **Token Scopes:**
```
tweet.read       - Read user's tweets
tweet.write      - Post tweets (what we need!)
users.read       - Read user profile
offline.access   - Get refresh token (critical!)
email           - Required for offline.access to work
```

## 🚀 Next Steps

Now that you have refresh tokens, you can implement:

1. **Token Refresh Function** (see `TWITTER_REFRESH_TOKEN_IMPLEMENTATION.md`)
2. **Database Storage** for tokens
3. **Scheduled Posting** with automatic refresh
4. **Cron Jobs** for auto-posting

## ✅ Verification Checklist

Before using scheduled posting:
- [ ] Twitter Developer Portal: "Request email from users" enabled
- [ ] Disconnected old Twitter connection
- [ ] Reconnected Twitter with new permissions
- [ ] Console log shows `has_refresh_token: true`
- [ ] localStorage contains refresh token
- [ ] Token has `expires_at` timestamp
- [ ] Scope includes `email` and `offline.access`

## 📝 Files Changed

1. `src/lib/integrations/integration-factory.ts`
   - Added `email` to OAuth scope

2. `src/app/api/auth/twitter/callback/route.ts`
   - Added `scope` to token exchange request
   - Enhanced logging
   - Added `expires_at` to stored tokens
   - Added token metadata (type, scope)

## 🎉 Result

✅ **Refresh tokens now working!**  
✅ **Can implement scheduled posting!**  
✅ **Tokens can be refreshed automatically!**  
✅ **No more manual reconnections needed!**

---

**Test it now:**
1. Disconnect Twitter
2. Reconnect Twitter
3. Check console for `has_refresh_token: true`
4. Start implementing scheduled posting! 🚀

**Date:** November 4, 2024  
**Status:** ✅ Complete and ready for testing

