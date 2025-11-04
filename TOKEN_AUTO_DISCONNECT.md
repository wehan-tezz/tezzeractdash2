# Token Auto-Disconnect Feature

## Problem
When users logged out or platform OAuth tokens expired, the UI would still show platforms as "connected" because the connection status was based solely on the presence of tokens in localStorage, not their validity. This led to 401 authentication errors when trying to fetch data from expired tokens.

## Solution
Implemented a comprehensive token management system that:

1. **Validates tokens before use** - Checks expiration timestamps
2. **Auto-disconnects on 401 errors** - Removes invalid tokens automatically
3. **Cleans up expired tokens** - Runs cleanup on page load
4. **Centralized token management** - Single source of truth for token operations

## Implementation

### 1. Token Manager (`src/lib/token-manager.ts`)

A centralized utility for managing platform tokens with the following features:

#### Key Functions:

- **`getToken(key)`** - Retrieves and validates a token from localStorage
  - Returns `null` if token is expired or invalid
  - Automatically removes expired tokens

- **`setToken(key, tokenData)`** - Stores a token with expiration timestamp
  - Automatically adds `expires_at` timestamp if `expires_in` is provided

- **`removeToken(key)`** - Removes a token and related data
  - Also cleans up platform-specific data (e.g., selected GA property)

- **`isPlatformConnected(key)`** - Checks if a platform has a valid token

- **`cleanupExpiredTokens()`** - Removes all expired tokens
  - Called on dashboard/setup page mount

- **`handleAuthError(key)`** - Handles 401 authentication errors
  - Removes the invalid token
  - Called when API returns 401

- **`disconnectAllPlatforms()`** - Removes all platform tokens
  - Called on user logout

#### Supported Platforms:
- `google_analytics_tokens`
- `youtube_tokens`
- `twitter_tokens`
- `meta_tokens` (Facebook & Instagram)
- `linkedin_tokens`

### 2. Dashboard Integration (`src/app/(dashboard)/dashboard/page.tsx`)

Updated to:
- Use `getToken()` instead of direct localStorage access
- Call `handleAuthError()` on 401 responses
- Run `cleanupExpiredTokens()` on mount

```typescript
// Before
const tokens = JSON.parse(localStorage.getItem('google_analytics_tokens'));

// After
const tokens = getToken('google_analytics_tokens');
if (!tokens) {
  // Token is expired or doesn't exist
  return null;
}
```

```typescript
// Handle 401 errors
if (response.status === 401) {
  console.log('Token expired or invalid, disconnecting...');
  handleAuthError('google_analytics_tokens');
}
```

### 3. Setup Page Integration (`src/app/(dashboard)/setup/page.tsx`)

Updated to:
- Use token manager for all token operations
- Check connection status using `isPlatformConnected()`
- Handle 401 errors when fetching properties/pages
- Store new tokens using `setToken()`

### 4. Logout Integration (`src/app/(dashboard)/layout.tsx`)

Updated logout handler to:
- Call `disconnectAllPlatforms()` before clearing localStorage
- Ensures clean disconnection of all platforms

## How It Works

### Token Expiration Check
```typescript
export function isTokenExpired(tokenData: TokenData): boolean {
  if (!tokenData) return true;
  
  // Check if expires_at is set (Unix timestamp in seconds)
  if (tokenData.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    return now >= tokenData.expires_at;
  }
  
  // If no expiration info, let API validate
  return false;
}
```

### Auto-Disconnect Flow

1. **User loads dashboard** → `cleanupExpiredTokens()` runs
2. **Expired tokens found** → Automatically removed from localStorage
3. **API call with valid token** → Works normally
4. **API returns 401** → `handleAuthError()` removes token
5. **Next render** → Platform shows as disconnected

### Token Storage Format

Tokens are stored with expiration information:
```json
{
  "access_token": "ya29.a0...",
  "refresh_token": "1//...",
  "expires_in": 3600,
  "expires_at": 1730745600,  // Added automatically
  "token_type": "Bearer"
}
```

## Benefits

1. **No stale connections** - Expired tokens are automatically removed
2. **Better UX** - Users see accurate connection status
3. **Reduced errors** - No 401 errors from expired tokens
4. **Centralized logic** - All token operations in one place
5. **Easy maintenance** - Single source of truth for token management

## Testing

### Manual Test Steps:

1. **Test Expired Token Cleanup:**
   - Connect a platform (e.g., Google Analytics)
   - Manually edit localStorage to set `expires_at` to a past timestamp
   - Refresh the dashboard
   - Platform should show as disconnected

2. **Test 401 Auto-Disconnect:**
   - Connect a platform
   - Wait for token to expire naturally (or revoke access in platform settings)
   - Refresh the dashboard
   - Platform should auto-disconnect after 401 error

3. **Test Logout:**
   - Connect multiple platforms
   - Logout
   - Login again
   - All platforms should show as disconnected

4. **Test Valid Token:**
   - Connect a platform
   - Verify data loads correctly
   - Platform should remain connected

## Future Enhancements

1. **Token Refresh** - Automatically refresh tokens before expiration
2. **Background Validation** - Periodically check token validity
3. **User Notifications** - Alert users when tokens expire
4. **Database Storage** - Store tokens in Supabase instead of localStorage
5. **Token Encryption** - Encrypt tokens in localStorage for security

## API Routes

The following API routes properly return 401 status codes on authentication errors:
- `/api/integrations/google-analytics/data`
- `/api/integrations/google-analytics/properties`
- `/api/integrations/youtube/data`
- `/api/integrations/twitter/data`
- `/api/integrations/meta/data`
- `/api/integrations/meta/pages`

These routes already handle 401 errors correctly by returning the status from the upstream API (Google, Meta, Twitter, etc.).

## Notes

- Tokens are still stored in localStorage (not encrypted)
- Token refresh is not yet implemented
- Some platforms may have different expiration times
- The system gracefully handles missing expiration data

