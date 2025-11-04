import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch user's Facebook Pages
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch Facebook pages', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const pages = data.data || [];

    // Format the pages data
    const formattedPages = pages.map((page: Record<string, unknown>) => ({
      id: page.id,
      name: page.name,
      access_token: page.access_token,
      category: page.category,
      tasks: page.tasks,
    }));

    return NextResponse.json({
      success: true,
      pages: formattedPages,
    });

  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

