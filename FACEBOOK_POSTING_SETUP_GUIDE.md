# Facebook Posting Setup Guide

This guide will help you set up Facebook posting functionality in your Tezzeract Analytics Dashboard.

## 🎯 Overview

The system now supports posting content directly to Facebook pages from the Calendar page. When you click the "Post" button on any calendar content item, it will publish to your connected Facebook page.

## 📋 Prerequisites

Before you can post to Facebook, you need to:

1. Have a Facebook Page (not a personal profile)
2. Have admin access to that Facebook Page
3. Create a Facebook App in Meta Developer Console
4. Get the necessary API permissions approved

## 🔧 Setup Steps

### Step 1: Create a Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Business" as your app type
4. Fill in your app details:
   - **App Name**: Tezzeract Analytics Dashboard
   - **App Contact Email**: wehan@tezzeract.com
   - **Business Account**: Select or create one

### Step 2: Add Required Products

1. In your app dashboard, click "Add Product"
2. Add **"Facebook Login"**
   - Click "Set Up"
   - Go to Settings
   - Add your redirect URL: `https://your-domain.com/api/auth/meta/callback`
   - For local development: `http://localhost:3000/api/auth/meta/callback`

3. Under **"Facebook Login" → "Settings"**:
   - Enable "Client OAuth Login": Yes
   - Enable "Web OAuth Login": Yes
   - Add Valid OAuth Redirect URIs:
     ```
     https://your-domain.com/api/auth/meta/callback
     http://localhost:3000/api/auth/meta/callback
     ```

### Step 3: Get Your App Credentials

1. Go to **Settings → Basic**
2. Copy your:
   - **App ID** → This is your `META_APP_ID`
   - **App Secret** (click "Show") → This is your `META_APP_SECRET`

### Step 4: Request Permissions

1. Go to **App Review → Permissions and Features**
2. Request the following permissions:
   - `pages_manage_posts` - **Required** for posting to Facebook Pages
   - `pages_read_engagement` - For reading page insights
   - `pages_show_list` - For listing your pages
   - `public_profile` - Basic user info
   - `email` - User email

3. For each permission:
   - Click "Request Advanced Access"
   - Follow the verification process
   - Provide screenshots and explain how you'll use it

### Step 5: Update Environment Variables

Add these to your `.env.local` file:

```env
# Meta/Facebook Configuration
META_APP_ID=your_facebook_app_id
META_APP_SECRET=your_facebook_app_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, update your Vercel environment variables.

### Step 6: Configure OAuth Scopes

The app is already configured to request these scopes:
- `pages_manage_posts`
- `pages_read_engagement`
- `public_profile`
- `email`

These are set in `src/lib/integrations/integration-factory.ts`

## 🚀 How to Use

### 1. Connect Your Facebook Account

1. Go to **Setup → Platform Connections**
2. Find **Meta (Facebook & Instagram)** card
3. Click **"Connect"**
4. Authorize the app in the Facebook popup
5. You'll be redirected back to the Setup page

### 2. Select Your Facebook Page

1. After connecting, a modal will appear showing all your Facebook Pages
2. Select the page you want to use for posting
3. The selected page will be saved and displayed in a green card below
4. You can change the page anytime by clicking **"Change"**

### 3. Post Content from Calendar

1. Go to **Calendar** page
2. Click on any content item or click **"Add Content"**
3. Fill in the content details:
   - **Title**: Content title (for internal use)
   - **Platform**: Select "Facebook"
   - **Caption**: Your post text
   - **Attachments**: Add image URLs or video URLs
4. Click **"Post"** button

The content will be published to your selected Facebook page!

## 📝 Content Format

### Text Post
```
Caption: Your post message here
Platform: Facebook
Attachments: None
```

### Image Post
```
Caption: Your post message with the image
Platform: Facebook
Attachments: 
  - Type: Image
  - URL: https://example.com/image.jpg
```

### Video Post
```
Caption: Your video description
Platform: Facebook
Attachments:
  - Type: Video
  - URL: https://example.com/video.mp4
```

### Link Post
```
Caption: Check out this link!
Platform: Facebook
Notes: Add the link in the caption or as an attachment URL
```

## 🔐 Permissions Required

| Permission | Purpose | Status |
|------------|---------|--------|
| `pages_manage_posts` | Post content to your Facebook Pages | Required |
| `pages_read_engagement` | Read page insights and metrics | Optional |
| `pages_show_list` | List all pages you manage | Required |
| `public_profile` | Get basic user information | Required |
| `email` | User email for account linking | Optional |

## ⚠️ Important Notes

### App Review Process

1. Facebook requires **App Review** for most permissions
2. You'll need to submit:
   - **Screenshots** of your app
   - **Screencast video** showing the posting flow
   - **Detailed description** of how you use each permission
   - **Privacy Policy URL**
   - **Terms of Service URL**

3. Review typically takes 1-2 weeks

### Testing Before Review

You can test with:
- **App administrators** (added in App Roles)
- **App developers** (added in App Roles)
- **Testers** (added in App Roles)

To add test users:
1. Go to **App Roles → Roles**
2. Add users as Administrators or Testers
3. They can use the app without App Review

### Development Mode

During development, your app is in "Development Mode":
- Only added roles can use it
- No public users can authenticate
- Perfect for testing

Switch to "Live Mode" after:
1. App Review is approved
2. All required permissions are granted
3. Privacy Policy is added
4. App is fully tested

## 🎨 Features Implemented

✅ **OAuth Authentication** - Connect Facebook account
✅ **Page Selection** - Choose which page to post to
✅ **Text Posts** - Post text-only content
✅ **Image Posts** - Post with images
✅ **Video Posts** - Post with videos
✅ **Status Updates** - Auto-update content status to "published"
✅ **Error Handling** - User-friendly error messages
✅ **Token Storage** - Secure token management in localStorage

## 🔄 API Endpoints Created

### 1. `/api/integrations/meta/pages` (GET)
Fetches all Facebook Pages the user manages.

**Query Parameters:**
- `access_token` - User's Facebook access token

**Response:**
```json
{
  "success": true,
  "pages": [
    {
      "id": "page_id",
      "name": "Page Name",
      "category": "Business",
      "access_token": "page_access_token"
    }
  ]
}
```

### 2. `/api/integrations/meta/post` (POST)
Posts content to a Facebook Page.

**Request Body:**
```json
{
  "access_token": "user_access_token",
  "page_id": "facebook_page_id",
  "message": "Post text content",
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://example.com/video.mp4",
  "scheduled_publish_time": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "post_id": "post_id_from_facebook",
  "message": "Successfully posted to Facebook"
}
```

## 🐛 Troubleshooting

### "Access token is required"
- Make sure you're connected to Facebook in Setup page
- Try disconnecting and reconnecting

### "Please select a Facebook Page first"
- Go to Setup → Platforms
- You should see your connected Facebook account
- A modal should appear with your pages - select one
- Or click "Change" button to select a different page

### "Failed to post to Facebook"
- Check if your Facebook Page has posting permissions
- Verify the image/video URL is publicly accessible
- Make sure your access token hasn't expired

### "Permission denied"
- The required permissions may not be approved yet
- Check App Review status in Meta Developer Console
- Add your account as a tester during development

### OAuth Error
- Check `META_APP_ID` and `META_APP_SECRET` in `.env.local`
- Verify redirect URI in Facebook App settings
- Clear browser cache and try again

## 📱 Testing Checklist

Before going to production:

- [ ] Connect Facebook account successfully
- [ ] See list of Facebook Pages in modal
- [ ] Select a page and see it displayed
- [ ] Create a test content item in Calendar
- [ ] Post text-only content
- [ ] Post content with image
- [ ] Post content with video
- [ ] Verify post appears on Facebook Page
- [ ] Check error handling (wrong URL, missing fields, etc.)
- [ ] Test disconnecting and reconnecting
- [ ] Test changing Facebook Page selection

## 🔮 Future Enhancements

Possible features to add:

1. **Scheduled Posts** - Already implemented! Use `scheduled_publish_time`
2. **Instagram Posting** - Use Instagram Graph API
3. **Post Previews** - Show how post will look before publishing
4. **Media Upload** - Upload images/videos directly instead of URLs
5. **Post Analytics** - Track post performance
6. **Multiple Images** - Carousel posts
7. **Tag People/Pages** - Mention other accounts
8. **Location Tagging** - Add location to posts
9. **Story Publishing** - Post to Facebook Stories
10. **Comment Management** - Reply to comments from dashboard

## 📚 Resources

- [Meta for Developers](https://developers.facebook.com/)
- [Facebook Pages API Documentation](https://developers.facebook.com/docs/pages-api)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review)
- [Facebook Business Help Center](https://www.facebook.com/business/help)

## 💡 Pro Tips

1. **Long-Lived Tokens**: Facebook User Access Tokens expire after 1-2 hours. The system automatically exchanges them for long-lived tokens (60 days). Page Access Tokens don't expire.

2. **Page Access Token**: When posting, the system converts your User Access Token to a Page Access Token automatically for better security.

3. **Rate Limits**: Facebook has rate limits (200 calls per hour per user). The app tracks this automatically.

4. **Media URLs**: Images and videos must be publicly accessible URLs. Consider using a CDN or cloud storage (AWS S3, Cloudinary, etc.)

5. **Testing**: Use Facebook's Graph API Explorer to test API calls manually before implementing in your app.

## 🎉 Success!

You're now ready to post to Facebook from your Tezzeract Analytics Dashboard!

If you have any questions or run into issues, please refer to:
- This guide
- Facebook Developer Documentation
- Your app's activity logs in Meta Developer Console

---

**Last Updated**: November 3, 2025
**Version**: 1.0
**Author**: Tezzeract AI Team

