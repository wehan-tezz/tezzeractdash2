import { BaseIntegration, IntegrationConfig, IntegrationData, PlatformMetrics } from './base-integration';

export class YouTubeIntegration extends BaseIntegration {
  private readonly analyticsBaseUrl = 'https://youtubeanalytics.googleapis.com/v2/reports';
  private readonly dataBaseUrl = 'https://www.googleapis.com/youtube/v3';

  getPlatformType(): string {
    return 'youtube';
  }

  getPlatformName(): string {
    return 'YouTube';
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test by fetching channel list
      const response = await this.makeAuthenticatedRequest(
        `${this.dataBaseUrl}/channels?part=snippet&mine=true`
      );
      return response.ok;
    } catch (error) {
      console.error('YouTube connection test failed:', error);
      return false;
    }
  }

  async refreshToken(): Promise<IntegrationConfig> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refresh_token!,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh YouTube token');
      }

      const data = await response.json();
      const newConfig = {
        ...this.config,
        access_token: data.access_token,
        refresh_token: data.refresh_token || this.config.refresh_token,
        expires_at: data.expires_in ? Date.now() / 1000 + data.expires_in : undefined,
      };

      this.config = newConfig;
      return newConfig;
    } catch (error) {
      console.error('Error refreshing YouTube token:', error);
      throw error;
    }
  }

  async fetchData(startDate: Date, endDate: Date): Promise<IntegrationData[]> {
    const data: IntegrationData[] = [];

    try {
      // First, get the channel ID
      const channelResponse = await this.makeAuthenticatedRequest(
        `${this.dataBaseUrl}/channels?part=id&mine=true`
      );

      if (!channelResponse.ok) {
        throw new Error('Failed to fetch YouTube channel');
      }

      const channelData = await channelResponse.json();
      const channelId = channelData.items?.[0]?.id;

      if (!channelId) {
        throw new Error('No YouTube channel found');
      }

      // Fetch analytics data
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const analyticsParams = new URLSearchParams({
        ids: `channel==${channelId}`,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,comments,shares',
        dimensions: 'day',
      });

      const analyticsResponse = await this.makeAuthenticatedRequest(
        `${this.analyticsBaseUrl}?${analyticsParams.toString()}`
      );

      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch YouTube analytics');
      }

      const analyticsData = await analyticsResponse.json();
      const rows = analyticsData.rows || [];

      rows.forEach((row: (string | number)[]) => {
        const [date, views, watchTime, avgDuration, subsGained, subsLost, likes, comments, shares] = row;
        
        data.push({
          date: String(date),
          metrics: {
            impressions: Number(views) || 0,
            reach: Number(views) || 0, // Use views as reach
            engagement: (Number(likes) || 0) + (Number(comments) || 0) + (Number(shares) || 0),
            clicks: Number(views) || 0,
            conversions: Number(subsGained) || 0,
            followers: (Number(subsGained) || 0) - (Number(subsLost) || 0),
          },
          raw_data: {
            views: Number(views),
            watchTime: Number(watchTime),
            avgDuration: Number(avgDuration),
            subsGained: Number(subsGained),
            subsLost: Number(subsLost),
            likes: Number(likes),
            comments: Number(comments),
            shares: Number(shares),
          },
        });
      });

    } catch (error) {
      console.error('Error fetching YouTube data:', error);
    }

    return data;
  }
}

