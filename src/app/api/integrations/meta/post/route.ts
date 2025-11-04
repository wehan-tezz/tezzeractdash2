import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      access_token,
      page_id, // Facebook Page ID
      message, // Post content/caption
      link, // Optional link
      image_url, // Optional image URL
      video_url, // Optional video URL
      scheduled_publish_time, // Optional: Unix timestamp for scheduled posts
    } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    if (!page_id) {
      return NextResponse.json(
        { error: 'Page ID is required. Please select a Facebook Page.' },
        { status: 400 }
      );
    }

    if (!message && !image_url && !video_url && !link) {
      return NextResponse.json(
        { error: 'At least one of message, image, video, or link is required' },
        { status: 400 }
      );
    }

    // First, get the Page Access Token from the user access token
    const pageTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page_id}?fields=access_token&access_token=${access_token}`
    );

    if (!pageTokenResponse.ok) {
      const error = await pageTokenResponse.json();
      return NextResponse.json(
        { error: 'Failed to get page access token', details: error },
        { status: 400 }
      );
    }

    const pageTokenData = await pageTokenResponse.json();
    const pageAccessToken = pageTokenData.access_token;

    // Prepare the post data
    const postData: Record<string, string> = {
      access_token: pageAccessToken,
    };

    if (message) {
      postData.message = message;
    }

    if (link) {
      postData.link = link;
    }

    if (scheduled_publish_time) {
      postData.published = 'false';
      postData.scheduled_publish_time = scheduled_publish_time.toString();
    }

    let endpoint = `https://graph.facebook.com/v18.0/${page_id}/feed`;
    
    // If there's an image, use photos endpoint instead
    if (image_url) {
      endpoint = `https://graph.facebook.com/v18.0/${page_id}/photos`;
      postData.url = image_url;
      if (message) {
        postData.caption = message;
        delete postData.message;
      }
    }

    // If there's a video, use videos endpoint instead
    if (video_url) {
      endpoint = `https://graph.facebook.com/v18.0/${page_id}/videos`;
      postData.file_url = video_url;
      if (message) {
        postData.description = message;
        delete postData.message;
      }
    }

    // Make the API call to post
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Facebook API error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to post to Facebook', 
          details: error,
          message: error.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      post_id: result.id,
      message: 'Successfully posted to Facebook',
      data: result,
    });

  } catch (error) {
    console.error('Error posting to Facebook:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

