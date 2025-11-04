import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // 'google_analytics' or 'youtube'
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=google_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=no_code`);
  }

  // Determine which platform based on state
  const platform = state === 'youtube' ? 'youtube' : 'google_analytics';

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    console.log('Google token received:', { expires_in: tokenData.expires_in, has_refresh: !!tokenData.refresh_token });
    
    // Get user info to verify the token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    const userData = await userResponse.json();
    console.log('Google user data:', userData);

    // Store tokens in localStorage via redirect with query params (temporary solution)
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_id: userData.id,
      user_name: userData.name,
      user_email: userData.email,
    };

    // Encode tokens to pass via URL (temporary - not secure for production)
    const encodedTokens = encodeURIComponent(JSON.stringify(tokens));
    
    // Include platform in the redirect so setup page knows what to do
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?success=google_connected&platform=${platform}&tokens=${encodedTokens}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=callback_failed`);
  }
}
