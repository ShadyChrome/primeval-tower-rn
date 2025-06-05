# Anonymous Authentication Setup Guide

## Quick Setup Required

To enable the anonymous sign-in functionality that has been implemented, you need to enable anonymous authentication in your Supabase project dashboard.

### Steps to Enable Anonymous Authentication:

1. **Go to your Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Open your project

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Go to **Settings** → **General**

3. **Enable Anonymous Sign-ins**
   - Scroll down to find **"Enable anonymous sign-ins"**
   - Toggle the switch to **ON**
   - Click **Save**

### Optional: Enable CAPTCHA (Recommended)
To prevent abuse of anonymous sign-ins:

1. In the same Authentication Settings page
2. Scroll to **"Security and Protection"**
3. Enable **"Enable Captcha protection"**
4. Configure either:
   - **Invisible reCAPTCHA** (recommended)
   - **Cloudflare Turnstile**

## What's Been Implemented

✅ **Anonymous Sign-in Button** - "Continue as Guest" option in the Auth component
✅ **Guest User Experience** - Different UI for anonymous vs permanent users  
✅ **Account Upgrade Flow** - Convert anonymous users to permanent accounts
✅ **Profile Management** - Anonymous users see upgrade prompts instead of profile settings
✅ **Session Handling** - Anonymous sessions persist like regular user sessions

## How It Works

1. **Guest Login**: Users can tap "Continue as Guest" to start using the app immediately
2. **Limited Experience**: Anonymous users see different content and upgrade prompts
3. **Account Upgrade**: Users can convert to permanent accounts by providing an email
4. **Data Persistence**: Anonymous user data remains tied to their ID during conversion

## Testing

Once you enable anonymous authentication in your Supabase dashboard:

1. **Test Anonymous Sign-in**:
   - Run the app: `npx expo start`
   - Tap "Continue as Guest"
   - Verify you see "Welcome, Guest!" message

2. **Test Account Upgrade**:
   - While signed in as guest, tap "Create Account"
   - Enter an email address
   - Check your email for verification link

3. **Test Profile Access**:
   - Anonymous users should see upgrade prompts instead of profile settings
   - Permanent users should see normal profile management

## Important Notes

- Anonymous users use the `authenticated` role in PostgreSQL
- They have an `is_anonymous` claim in their JWT
- Anonymous users are stored in your `auth.users` table
- Consider implementing data cleanup for old anonymous users
- Review RLS policies if you need to restrict anonymous user access

## Cleanup (Optional)

To automatically clean up old anonymous users, you can run this SQL in your Supabase dashboard periodically:

```sql
-- Deletes anonymous users created more than 30 days ago
DELETE FROM auth.users 
WHERE is_anonymous = true 
AND created_at < now() - interval '30 days';
```

That's it! Your anonymous authentication should work once you enable it in the dashboard. 