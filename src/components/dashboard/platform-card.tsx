"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlatformType, PlatformMetrics } from '@/types';
import { formatNumber } from '@/lib/utils';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  BarChart3, 
  DollarSign,
  Twitter,
  Music,
  Youtube
} from 'lucide-react';

interface PlatformCardProps {
  platform: PlatformType;
  metrics: PlatformMetrics;
  onViewDetails?: () => void;
}

const platformConfig = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-600',
    textColor: 'text-pink-600',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700',
    textColor: 'text-blue-700',
  },
  google_analytics: {
    name: 'Google Analytics',
    icon: BarChart3,
    color: 'bg-orange-600',
    textColor: 'text-orange-600',
  },
  google_ads: {
    name: 'Google Ads',
    icon: DollarSign,
    color: 'bg-green-600',
    textColor: 'text-green-600',
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
  },
  tiktok: {
    name: 'TikTok',
    icon: Music,
    color: 'bg-black',
    textColor: 'text-black',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    textColor: 'text-red-600',
  },
  csv_upload: {
    name: 'CSV Upload',
    icon: BarChart3,
    color: 'bg-gray-600',
    textColor: 'text-gray-600',
  },
};

export function PlatformCard({ platform, metrics, onViewDetails }: PlatformCardProps) {
  const config = platformConfig[platform as keyof typeof platformConfig] || platformConfig.facebook;
  const Icon = config.icon;

  const getTrendColor = () => {
    switch (metrics.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card className="card-hover animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={config.textColor}>
            {metrics.trend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{formatNumber(metrics.metrics.impressions)}</div>
            <div className="text-sm text-muted-foreground">Impressions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{formatNumber(metrics.metrics.engagement)}</div>
            <div className="text-sm text-muted-foreground">Engagement</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className={getTrendColor()}>
              {getTrendIcon()} {metrics.change.toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails} className="focus-ring">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
