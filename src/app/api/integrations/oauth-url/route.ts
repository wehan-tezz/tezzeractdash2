import { NextRequest, NextResponse } from 'next/server';
import { IntegrationFactory } from '@/lib/integrations/integration-factory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as 'facebook' | 'twitter' | 'google_analytics' | 'youtube';

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      );
    }

    const supportedPlatforms = IntegrationFactory.getSupportedPlatforms();
    const platformConfig = supportedPlatforms.find(p => p.type === platform);

    if (!platformConfig) {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      oauthUrl: platformConfig.oauthUrl,
      platform: platformConfig.type,
      name: platformConfig.name,
    });
  } catch (error) {
    console.error('Error getting OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to get OAuth URL' },
      { status: 500 }
    );
  }
}
