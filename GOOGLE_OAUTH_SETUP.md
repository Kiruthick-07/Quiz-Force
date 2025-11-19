# Google OAuth Setup Guide for Quiz-Force

## 🚨 Current Status
Google OAuth is currently **NOT CONFIGURED** and will show as disabled in the login page. Follow the steps below to enable it.

## 📋 Setup Instructions

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Quiz-Force-OAuth`
4. Click "Create"

### Step 2: Enable Google Identity Services
1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Identity"
3. Click on **"Google Identity Services"** 
4. Click **"Enable"**

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** (for testing) or **"Internal"** (for organization)
3. Fill in the required fields:
   - App name: `Quiz-Force`
   - User support email: Your email
   - Developer contact information: Your email
4. Click **"Save and Continue"**
5. Skip "Scopes" for now → **"Save and Continue"**
6. Add test users (your email) if using External → **"Save and Continue"**

### Step 4: Create OAuth 2.0 Client ID
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Choose **"Web application"**
4. Name: `Quiz-Force Web Client`
5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```
6. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
7. Click **"Create"**
8. **COPY THE CLIENT ID** (it looks like: `123456789-abcdefg.apps.googleusercontent.com`)

### Step 5: Update Your Code
1. Open `src/config/google-config.js`
2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```javascript
   export const GOOGLE_CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
   ```

### Step 6: Test the Integration
1. Start your development server: `npm run dev`
2. Go to login page
3. The "Continue with Google" button should now be enabled
4. Click it to test Google OAuth flow

## 🛠 Troubleshooting

### If you see "ERR_BLOCKED_BY_CLIENT":
- **Disable ad blockers** (uBlock Origin, AdBlock Plus, etc.)
- **Disable browser privacy extensions**
- **Check browser settings** for popup blockers
- **Try incognito/private mode**

### If Google popup doesn't appear:
- Check browser console for errors
- Ensure Client ID is correct
- Verify authorized origins include your localhost URL
- Try refreshing the page

### If authentication fails:
- Check that test users are added in OAuth consent screen
- Verify the app is in "Testing" mode if using External user type
- Ensure all required scopes are configured

## 🔒 Security Notes

- Never commit your actual Client ID to public repositories
- Use environment variables for production
- Regularly rotate your OAuth credentials
- Review and limit OAuth scopes to minimum required

## 📝 Current Implementation Features

✅ **Error Handling**: Shows user-friendly messages when OAuth is not configured
✅ **Fallback**: Regular login still works if Google OAuth fails
✅ **Visual Feedback**: Button appears disabled when not configured
✅ **Browser Compatibility**: Handles popup blockers and script loading failures
✅ **Role Selection**: Users select Student/Admin role before Google sign-in

## 🎯 Next Steps After Setup

1. Test with different user accounts
2. Implement server-side Google token verification (optional)
3. Add Google OAuth to signup page
4. Configure production domain in Google Cloud Console

---

**Need Help?** 
- Check Google Cloud Console documentation
- Review browser developer tools for specific error messages
- Test with a fresh browser profile to rule out extension conflicts