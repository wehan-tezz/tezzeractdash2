import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=twitter_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
        code_verifier: state || '', // Use state as code_verifier for PKCE
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Twitter token exchange error:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Log what we received (helps debug refresh token issues)
    console.log('Twitter token received:', { 
      expires_in: tokenData.expires_in, 
      has_access_token: !!tokenData.access_token,
      has_refresh_token: !!tokenData.refresh_token,
      scope: tokenData.scope,
      token_type: tokenData.token_type
    });
    
    // Warning if no refresh token (needs offline.access scope + app approval)
    if (!tokenData.refresh_token) {
      console.warn('⚠️ No refresh token received. Tokens will expire in 2 hours. Enable "offline.access" in Twitter Developer Portal.');
    }
    
    // Get user info to verify the token
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=id,name,username,public_metrics', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    const userData = await userResponse.json();
    console.log('Twitter user data:', userData);

    // Calculate expiration timestamp
    const expiresAt = tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null;

    // Store tokens in localStorage via URL parameters (similar to other platforms)
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null, // null if not provided
      expires_in: tokenData.expires_in,
      expires_at: expiresAt,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      user_id: userData.data?.id,
      user_name: userData.data?.name,
      username: userData.data?.username,
    };

    // Redirect to setup page with tokens
    const tokensParam = encodeURIComponent(JSON.stringify(tokens));
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?success=twitter_connected&tokens=${tokensParam}`);
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=callback_failed`);
  }
}
