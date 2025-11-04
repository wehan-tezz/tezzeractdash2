/**
 * Token Manager - Handles token validation and cleanup
 * Automatically removes expired or invalid tokens from localStorage
 */

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  [key: string]: unknown;
}

const TOKEN_KEYS = [
  'google_analytics_tokens',
  'youtube_tokens',
  'twitter_tokens',
  'meta_tokens',
  'linkedin_tokens',
] as const;

type TokenKey = typeof TOKEN_KEYS[number];

/**
 * Check if a token has expired
 */
export function isTokenExpired(tokenData: TokenData): boolean {
  if (!tokenData) return true;
  
  // Check if expires_at is set (Unix timestamp in seconds)
  if (tokenData.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    return now >= tokenData.expires_at;
  }
  
  // Check if expires_in is set (seconds from now)
  if (tokenData.expires_in) {
    // If we don't have a stored timestamp, we can't determine expiration
    // In this case, we'll assume it might be expired and let the API validate
    return false;
  }
  
  // If no expiration info, assume token is valid and let API validate
  return false;
}

/**
 * Get token from localStorage and validate it
 */
export function getToken(key: TokenKey): TokenData | null {
  try {
    const tokenStr = localStorage.getItem(key);
    if (!tokenStr) return null;
    
    const tokenData = JSON.parse(tokenStr) as TokenData;
    
    // Check if token is expired
    if (isTokenExpired(tokenData)) {
      console.log(`Token for ${key} has expired, removing...`);
      removeToken(key);
      return null;
    }
    
    return tokenData;
  } catch (error) {
    console.error(`Error parsing token for ${key}:`, error);
    removeToken(key);
    return null;
  }
}

/**
 * Store token in localStorage with expiration timestamp
 */
export function setToken(key: TokenKey, tokenData: TokenData): void {
  try {
    // Add expires_at timestamp if we have expires_in
    if (tokenData.expires_in && !tokenData.expires_at) {
      tokenData.expires_at = Math.floor(Date.now() / 1000) + tokenData.expires_in;
    }
    
    localStorage.setItem(key, JSON.stringify(tokenData));
  } catch (error) {
    console.error(`Error storing token for ${key}:`, error);
  }
}

/**
 * Remove a specific token from localStorage
 */
export function removeToken(key: TokenKey): void {
  try {
    localStorage.removeItem(key);
    
    // Also remove related data
    if (key === 'google_analytics_tokens') {
      localStorage.removeItem('google_analytics_selected_property');
    }
  } catch (error) {
    console.error(`Error removing token for ${key}:`, error);
  }
}

/**
 * Check if a platform is connected (has valid token)
 */
export function isPlatformConnected(key: TokenKey): boolean {
  const token = getToken(key);
  return token !== null;
}

/**
 * Clean up all expired tokens
 */
export function cleanupExpiredTokens(): void {
  TOKEN_KEYS.forEach(key => {
    const tokenStr = localStorage.getItem(key);
    if (tokenStr) {
      try {
        const tokenData = JSON.parse(tokenStr) as TokenData;
        if (isTokenExpired(tokenData)) {
          console.log(`Removing expired token: ${key}`);
          removeToken(key);
        }
      } catch (error) {
        console.error(`Error checking token ${key}:`, error);
        removeToken(key);
      }
    }
  });
}

/**
 * Handle API authentication error (401)
 * Removes the token and returns false to indicate disconnection
 */
export function handleAuthError(key: TokenKey): void {
  console.log(`Authentication error for ${key}, removing token...`);
  removeToken(key);
}

/**
 * Get all connected platforms
 */
export function getConnectedPlatforms(): TokenKey[] {
  return TOKEN_KEYS.filter(key => isPlatformConnected(key));
}

/**
 * Disconnect all platforms
 */
export function disconnectAllPlatforms(): void {
  TOKEN_KEYS.forEach(key => removeToken(key));
}

