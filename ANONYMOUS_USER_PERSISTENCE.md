# Anonymous User Persistence

## Overview

This implementation provides a simplified approach to anonymous user continuity. When anonymous users sign out and back in, they get a fresh Supabase session but are recognized as returning users for UI/UX purposes.

## How It Works

### 1. UUID Storage
When an anonymous user signs in for the first time, only their user ID (UUID) is stored locally using AsyncStorage.

### 2. Returning User Detection
When an anonymous user attempts to sign in again, the system:
1. Checks if there's a stored anonymous user ID
2. Always creates a fresh Supabase session (new tokens, new user ID)
3. Marks the session as belonging to a "returning" user for UI purposes

### 3. Smart Sign-Out
The sign-out process preserves anonymous user ID for future sign-ins, but clears it when permanent users sign out to prevent conflicts.

## Key Components

### AnonymousUserManager
- `signInAnonymously()` - Creates fresh session but detects returning users
- `handleSignOut()` - Smart sign-out that preserves anonymous data when appropriate
- `storeAnonymousUserId()` / `getStoredAnonymousUserId()` - User ID persistence
- `getOriginalAnonymousUserId()` - Gets the original UUID for data queries
- `convertToPermanentUser()` - Clears anonymous data when upgrading to permanent account
- `isReturningAnonymousUser()` - Checks if user has signed in anonymously before

### Modified Components
- **Auth.tsx**: Uses `AnonymousUserManager.signInAnonymously()` instead of direct Supabase call
- **Home.tsx**: Uses `AnonymousUserManager.handleSignOut()` and shows "Welcome back" message for returning users
- **App.tsx**: Automatically stores user ID for anonymous users when sessions are created by Supabase

## User Experience

### First-time Anonymous User
1. Taps "Continue as Guest"
2. Sees "Welcome, Guest!" message
3. User ID and session stored locally

### Returning Anonymous User
1. Taps "Continue as Guest" 
2. System creates fresh session but recognizes returning user
3. Sees "Welcome back, Guest!" message
4. Can access previous data using original UUID

### Account Upgrade
1. Anonymous user can upgrade to permanent account
2. Anonymous data is cleared to prevent conflicts
3. User becomes permanent user with email/password

## Technical Details

### Storage Keys
- `anonymous_user_id` - Stores the original anonymous user ID
- `session_restored_for_[UUID]` - Temporary flag for UI feedback

### User Recognition Strategy
1. **Check for Stored UUID** - Look for previously stored anonymous user ID
2. **Create Fresh Session** - Always use Supabase's `signInAnonymously()` for security
3. **Mark as Returning** - Flag the session for UI/UX differentiation

### Error Handling
- Always succeeds (creates fresh session)
- Simple console logging for debugging
- Automatic cleanup of stale flags

## Testing

### Test Scenarios
1. **Basic Anonymous Sign-in**: Verify new anonymous users work normally
2. **Session Persistence**: Sign out and back in, verify same user ID
3. **Account Upgrade**: Convert to permanent account, verify anonymous data cleared
4. **Token Expiration**: Test behavior with expired tokens (refresh flow)
5. **Mixed Users**: Test switching between anonymous and permanent users

### Console Output
The system logs simple messages:
- "New anonymous user created"
- "Returning anonymous user - fresh session created"

### Debugging
Much simpler debugging with clear messages:
- Check if stored UUID exists
- Verify fresh session creation
- Confirm UI shows correct welcome message

Possible issues:
1. **Storage permissions**: AsyncStorage access issues
2. **Supabase configuration**: Ensure anonymous auth is enabled

## Benefits

1. **Better UX**: Returning users get personalized welcome messages
2. **Simplicity**: No complex session restoration logic
3. **Reliability**: Always creates fresh, valid sessions
4. **Security**: Relies on Supabase's secure token generation
5. **Clean**: Simple storage and cleanup

## Data Access Pattern

For apps that need to link data to anonymous users:

```typescript
// Get the original UUID for database queries
const originalUserId = await AnonymousUserManager.getOriginalAnonymousUserId(session.user.id)

// Use this ID for all data operations
const userPosts = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', originalUserId)
```

## Future Enhancements

- Optional user notification when returning as anonymous user
- Analytics tracking for anonymous user retention
- Configurable UUID expiration handling 