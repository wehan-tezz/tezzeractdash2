# 🚀 How to Post to Twitter from Calendar

## Quick Guide (30 seconds)

### Step 1: Open Calendar
Go to **Content Calendar** page

### Step 2: Click on Content
Click any content item (or create new one)

### Step 3: Set Platform to Twitter
In the modal, make sure **Platform** is set to "Twitter"

### Step 4: Add Your Content
- **Caption:** Your tweet text
- **Hashtags:** Optional hashtags (e.g., `#Tech #Innovation`)

### Step 5: Click "Post"
Click the blue **"Post"** button at the bottom

### Step 6: Done! 🎉
Your tweet is now live on Twitter!

---

## 📝 Detailed Walkthrough

### Creating New Content

1. **Go to Calendar Page**
   ```
   http://localhost:3000/calendar
   ```

2. **Click "+ Add Content"**
   - Top right corner of the page

3. **Fill in the Form:**
   - **Title:** "My First Tweet from Calendar"
   - **Posting Date:** Today's date
   - **Platform:** Select "Twitter" ✅
   - **Content Type:** "Post"
   - **Status:** "Draft"
   - **Caption:** Your tweet text (max 280 chars)
   - **Hashtags:** `#FirstTweet #TestPost` (optional)

4. **Click "Save"**
   - Content is now in your calendar

### Posting Existing Content

1. **Find Your Content**
   - In calendar view or table view
   - Click on the content item

2. **Review in Modal**
   - Check caption text
   - Verify hashtags
   - Confirm platform is "Twitter"

3. **Click "Post" Button**
   - Blue button at bottom right
   - Next to "Save" button

4. **Wait for Confirmation**
   - Shows "Posting..." while processing
   - Alert: "Content posted successfully!"
   - Status changes to "Published"

5. **Verify on Twitter**
   - Open Twitter/X
   - Check your profile
   - Tweet should be there! ✅

---

## 💡 Pro Tips

### Tip 1: Character Counter
The modal doesn't show a character counter yet, but:
- Caption + hashtags must be ≤ 280 characters
- Error will show if exceeded
- Plan: ~250 chars for caption, ~30 for hashtags

### Tip 2: Hashtag Format
You can write hashtags with or without `#`:
- ✅ `Tech Innovation` → Auto-converts to `#Tech #Innovation`
- ✅ `#Tech #Innovation` → Stays as is

### Tip 3: Preview Before Posting
What you see in the caption field is what gets posted:
```
Caption: "Check out our new feature! 🚀"
Hashtags: #ProductLaunch #Tech

Posted Tweet:
"Check out our new feature! 🚀

#ProductLaunch #Tech"
```

### Tip 4: Save First, Post Later
Recommended workflow:
1. Save as "Draft"
2. Review later
3. Edit if needed
4. Post when ready

### Tip 5: Bulk Posting
Want to post multiple tweets?
1. Create all content items first
2. Set platform to "Twitter" for each
3. Post them one by one
4. Status tracks which are published

---

## ⚠️ Common Issues

### Issue: "Please connect your Twitter account first"
**What it means:** Twitter not connected

**Solution:**
1. Go to `/setup` page
2. Find "Twitter/X" card
3. Click "Connect"
4. Authorize the app
5. Come back to calendar and try again

---

### Issue: "Tweet text exceeds 280 characters"
**What it means:** Your caption + hashtags is too long

**Solution:**
1. Shorten your caption
2. Or remove some hashtags
3. Current length shown in error message

---

### Issue: "Twitter token expired"
**What it means:** Your Twitter connection expired (after 2 hours)

**Solution:**
1. Go to `/setup` page
2. Click "Disconnect" on Twitter
3. Click "Connect" again
4. Authorize
5. Try posting again

---

### Issue: "Tweet text is required"
**What it means:** Caption and description are both empty

**Solution:**
1. Add text to the "Caption" field
2. Or add text to "Description" field
3. At least one must have content

---

### Issue: Post button is disabled
**What it means:** Form is being processed

**Possible reasons:**
- Currently saving
- Currently posting
- Wait for current operation to finish

---

## 🎯 Examples

### Example 1: Simple Tweet
```
Title: "Product Update"
Platform: Twitter
Caption: "We just launched a new feature! Check it out 🚀"
Hashtags: (leave empty)
Status: Draft

Click "Post" → Tweet appears on Twitter
```

### Example 2: Tweet with Hashtags
```
Title: "Weekly Tips"
Platform: Twitter
Caption: "Here's our top tip for this week: Always test before deploying!"
Hashtags: #DevTips #BestPractices #Tech
Status: Draft

Click "Post" → Tweet with hashtags appears
```

### Example 3: Scheduled Content
```
Title: "Monday Motivation"
Platform: Twitter
Caption: "Start your week strong! 💪"
Hashtags: #MondayMotivation #Productivity
Status: Scheduled
Posting Date: Next Monday

Click "Post" → Posts immediately (scheduling not auto-posted yet)
Status changes to "Published"
```

---

## 🔄 Workflow Diagram

```
Create Content
    ↓
Save as Draft
    ↓
Review Content
    ↓
Edit if Needed
    ↓
Click "Post"
    ↓
Validation Check
    ↓
Post to Twitter API
    ↓
Update Status to "Published"
    ↓
Success! ✅
```

---

## ✅ Checklist

Before posting, make sure:
- [ ] Twitter is connected in Setup page
- [ ] Platform is set to "Twitter"
- [ ] Caption or description has text
- [ ] Total text is under 280 characters
- [ ] Content is saved
- [ ] You're ready to post publicly

---

## 🎉 You're Ready!

Now you can:
- ✅ Create content in calendar
- ✅ Post tweets with one click
- ✅ Track what's published
- ✅ Manage your Twitter content

**Happy tweeting! 🐦✨**

---

**Need Help?**
- Check `CALENDAR_TWITTER_POSTING.md` for technical details
- Check `TWITTER_POSTING_SETUP.md` for Twitter setup
- Check browser console for error details

