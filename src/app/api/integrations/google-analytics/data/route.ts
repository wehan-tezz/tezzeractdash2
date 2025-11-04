import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const propertyId = searchParams.get('property_id'); // Optional: specific GA4 property
    const dateRange = searchParams.get('date_range') || '30d'; // Default to 30 days

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // First, get list of GA4 properties
    let selectedPropertyId = propertyId;
    
    if (!selectedPropertyId) {
      const accountsResponse = await fetch(
        'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text();
        console.error('GA4 accounts API error:', errorText);
        return NextResponse.json(
          { error: 'Failed to fetch GA4 accounts' },
          { status: accountsResponse.status }
        );
      }

      const accountsData = await accountsResponse.json();
      
      // Get the first GA4 property
      const firstProperty = accountsData.accountSummaries?.[0]?.propertySummaries?.[0];
      
      if (!firstProperty) {
        return NextResponse.json(
          { error: 'No GA4 properties found. Please create a GA4 property first.' },
          { status: 404 }
        );
      }

      // Extract property ID from the property name (format: properties/123456789)
      selectedPropertyId = firstProperty.property.split('/')[1];
    }

    // Calculate date range based on the selected period
    const endDate = new Date();
    const startDate = new Date();
    
    // Determine number of days to go back
    let daysToSubtract = 30; // Default
    if (dateRange === 'today') daysToSubtract = 0;
    else if (dateRange === '7d') daysToSubtract = 7;
    else if (dateRange === '30d') daysToSubtract = 30;
    else if (dateRange === '90d') daysToSubtract = 90;
    
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Fetch GA4 data using Data API
    const reportRequest = {
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [
        { name: 'date' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'engagementRate' },
        { name: 'conversions' },
        { name: 'eventCount' },
      ],
    };

    const reportResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${selectedPropertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportRequest),
      }
    );

    if (!reportResponse.ok) {
      const errorText = await reportResponse.text();
      console.error('GA4 report API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch GA4 report data' },
        { status: reportResponse.status }
      );
    }

    const reportData = await reportResponse.json();

    // Process and aggregate the data
    let totalSessions = 0;
    let totalUsers = 0;
    let totalPageViews = 0;
    let totalConversions = 0;
    let totalEvents = 0;
    let avgEngagementRate = 0;

    const rows = reportData.rows || [];
    
    rows.forEach((row: Record<string, unknown>) => {
      const metricValues = row.metricValues as Array<{ value?: string }> | undefined;
      if (!metricValues) return;
      
      totalSessions += parseInt(metricValues[0]?.value || '0');
      totalUsers += parseInt(metricValues[1]?.value || '0');
      totalPageViews += parseInt(metricValues[2]?.value || '0');
      avgEngagementRate += parseFloat(metricValues[3]?.value || '0');
      totalConversions += parseInt(metricValues[4]?.value || '0');
      totalEvents += parseInt(metricValues[5]?.value || '0');
    });

    avgEngagementRate = rows.length > 0 ? avgEngagementRate / rows.length : 0;

    // Process daily data for charts
    const dailyData = rows.map((row: Record<string, unknown>) => {
      const dimensionValues = row.dimensionValues as Array<{ value?: string }> | undefined;
      const metricValues = row.metricValues as Array<{ value?: string }> | undefined;
      
      if (!dimensionValues || !metricValues) return null;
      
      // Parse date (format: YYYYMMDD)
      const dateStr = dimensionValues[0]?.value || '';
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const date = new Date(`${year}-${month}-${day}`);
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: parseInt(metricValues[0]?.value || '0'), // sessions
        reach: parseInt(metricValues[1]?.value || '0'), // users
        engagement: parseInt(metricValues[2]?.value || '0'), // page views
        clicks: parseInt(metricValues[2]?.value || '0'), // page views
        conversions: parseInt(metricValues[4]?.value || '0'),
      };
    }).filter(Boolean); // Remove any null entries

    const metrics = {
      impressions: totalSessions, // Using sessions as impressions
      reach: totalUsers, // Total users as reach
      engagement: Math.round(totalPageViews * avgEngagementRate), // Engaged page views
      clicks: totalPageViews, // Page views as clicks
      conversions: totalConversions,
      followers: 0, // Not applicable for GA
      sessions: totalSessions,
      users: totalUsers,
      pageViews: totalPageViews,
      engagementRate: avgEngagementRate,
      events: totalEvents,
    };

    return NextResponse.json({
      success: true,
      propertyId: selectedPropertyId,
      metrics,
      dailyData, // Include daily breakdown
      raw_data: {
        reportData,
        dateRange: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      },
    });
  } catch (error) {
    console.error('Google Analytics data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Analytics data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

