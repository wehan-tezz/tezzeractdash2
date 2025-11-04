import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, text, media_ids } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet text is required' },
        { status: 400 }
      );
    }

    // Check tweet length (Twitter allows up to 280 characters for standard tweets)
    if (text.length > 280) {
      return NextResponse.json(
        { error: 'Tweet text exceeds 280 characters' },
        { status: 400 }
      );
    }

    // Prepare tweet payload
    const tweetPayload: {
      text: string;
      media?: { media_ids: string[] };
    } = {
      text: text.trim(),
    };

    // Add media if provided
    if (media_ids && Array.isArray(media_ids) && media_ids.length > 0) {
      tweetPayload.media = { media_ids };
    }

    // Post tweet to Twitter API v2
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Twitter API error:', errorData);
      
      // Handle specific Twitter API errors
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid or expired access token' },
          { status: 401 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Forbidden - Check if your app has tweet.write permissions' },
          { status: 403 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to post tweet',
          details: errorData.detail || errorData.title || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const tweetData = await response.json();
    console.log('Tweet posted successfully:', tweetData);

    return NextResponse.json({
      success: true,
      tweet: {
        id: tweetData.data.id,
        text: tweetData.data.text,
        created_at: new Date().toISOString(),
      },
      message: 'Tweet posted successfully!',
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    return NextResponse.json(
      { 
        error: 'Failed to post tweet',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check posting capability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Verify the token has tweet.write permissions by checking user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();

    return NextResponse.json({
      success: true,
      can_post: true,
      user: {
        id: userData.data.id,
        username: userData.data.username,
        name: userData.data.name,
      },
      message: 'Ready to post tweets',
    });
  } catch (error) {
    console.error('Error checking Twitter posting capability:', error);
    return NextResponse.json(
      { error: 'Failed to verify posting capability' },
      { status: 500 }
    );
  }
}

