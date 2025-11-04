# Facebook Posting - Quick Start

## What You Need To Do NOW ✅

### 1. Get Facebook App Credentials (5 minutes)

1. Go to https://developers.facebook.com/
2. Create a new app (Business type)
3. Add "Facebook Login" product
4. Get your credentials from Settings → Basic:
   - **App ID**
   - **App Secret**

### 2. Update Environment Variables

Add to your `.env.local`:

```env
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure OAuth Redirect URI

In Facebook App Settings → Facebook Login → Settings:

Add this URL:
```
http://localhost:3000/api/auth/meta/callback
```

For production:
```
https://your-domain.vercel.app/api/auth/meta/callback
```

### 4. Request Permissions

In Facebook App → App Review → Permissions:

Request these permissions:
- ✅ `pages_manage_posts` (REQUIRED for posting)
- ✅ `pages_show_list` (REQUIRED for page selection)
- ✅ `pages_read_engagement` (optional, for analytics)
- ✅ `public_profile` (required)

**Note**: During development, add yourself as an App Administrator or Tester to bypass App Review.

### 5. Add Test Users

Go to App Roles → Roles:
- Add `wehan@tezzeract.com` as Administrator
- Add your Gmail as Administrator

This lets you test without waiting for App Review!

---

## How to Use (Once Setup is Complete)

### Connect Facebook:
1. Go to **Setup** page
2. Click **"Connect"** on Meta card
3. Authorize in popup
4. **Select your Facebook Page** from the modal

### Post Content:
1. Go to **Calendar** page
2. Click on a content item
3. Fill in details (caption, image URL, etc.)
4. Click **"Post"** button
5. ✅ Content is published to your Facebook Page!

---

## Quick Troubleshooting

**"Access token required"** → Connect Facebook in Setup first

**"Please select a Facebook Page"** → Go to Setup and select a page

**"Permission denied"** → Add yourself as App Administrator in Facebook App

**"Can't connect"** → Check META_APP_ID and META_APP_SECRET in .env.local

---

## Files Created/Modified

✅ `/api/integrations/meta/post/route.ts` - Posting endpoint
✅ `/api/integrations/meta/pages/route.ts` - Fetch pages endpoint  
✅ `/app/(dashboard)/calendar/page.tsx` - Added post functionality
✅ `/app/(dashboard)/setup/page.tsx` - Added page selection
✅ `/components/calendar/content-detail-modal.tsx` - Added Post button

---

## Testing Locally

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000/setup
3. Connect Facebook
4. Select a page
5. Go to Calendar and create/post content

---

## For Production Deploy

1. Update Vercel env vars with META_APP_ID and META_APP_SECRET
2. Add production redirect URI in Facebook App settings
3. Submit App Review for permissions (takes 1-2 weeks)
4. Switch app to "Live Mode" after approval

---

📚 **Full Guide**: See `FACEBOOK_POSTING_SETUP_GUIDE.md` for detailed instructions

🎯 **Need Help?** Check Facebook Developer Docs: https://developers.facebook.com/docs/pages-api

