import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const dateRange = searchParams.get('date_range') || '30d';

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    let daysToSubtract = 30;
    if (dateRange === 'today') daysToSubtract = 0;
    else if (dateRange === '7d') daysToSubtract = 7;
    else if (dateRange === '30d') daysToSubtract = 30;
    else if (dateRange === '90d') daysToSubtract = 90;
    
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Get channel ID and statistics
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=id,statistics&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('YouTube channel API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch YouTube channel' },
        { status: channelResponse.status }
      );
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];
    
    if (!channel) {
      return NextResponse.json(
        { error: 'No YouTube channel found. Please make sure you have a YouTube channel.' },
        { status: 404 }
      );
    }

    const channelId = channel.id;
    const stats = channel.statistics;

    // Fetch analytics data
    const analyticsParams = new URLSearchParams({
      ids: `channel==${channelId}`,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,comments,shares',
      dimensions: 'day',
    });

    const analyticsResponse = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?${analyticsParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.error('YouTube analytics API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch YouTube analytics' },
        { status: analyticsResponse.status }
      );
    }

    const analyticsData = await analyticsResponse.json();
    
    // Process data
    let totalViews = 0;
    let totalEngagement = 0;
    let totalSubscribers = 0;
    
    const dailyData = (analyticsData.rows || []).map((row: (string | number)[]) => {
      const [date, views, watchTime, avgDuration, subsGained, subsLost, likes, comments, shares] = row;
      
      const numViews = Number(views) || 0;
      const numLikes = Number(likes) || 0;
      const numComments = Number(comments) || 0;
      const numShares = Number(shares) || 0;
      const numSubsGained = Number(subsGained) || 0;
      const numSubsLost = Number(subsLost) || 0;
      
      totalViews += numViews;
      totalEngagement += numLikes + numComments + numShares;
      totalSubscribers += numSubsGained - numSubsLost;
      
      // Format date
      const dateObj = new Date(String(date));
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: formattedDate,
        impressions: numViews,
        reach: numViews,
        engagement: numLikes + numComments + numShares,
        clicks: numViews,
        conversions: numSubsGained,
      };
    });

    const metrics = {
      impressions: totalViews,
      reach: parseInt(stats.viewCount || '0'),
      engagement: totalEngagement,
      clicks: totalViews,
      conversions: totalSubscribers,
      followers: parseInt(stats.subscriberCount || '0'),
      views: totalViews,
      subscribers: parseInt(stats.subscriberCount || '0'),
      videos: parseInt(stats.videoCount || '0'),
    };

    return NextResponse.json({
      success: true,
      channelId,
      metrics,
      dailyData,
      raw_data: {
        channelStats: stats,
        dateRange: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      },
    });
  } catch (error) {
    console.error('YouTube data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

