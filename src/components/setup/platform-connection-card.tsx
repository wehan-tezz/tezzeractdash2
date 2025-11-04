"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  BarChart3, 
  DollarSign,
  Twitter,
  Music,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface PlatformConnectionCardProps {
  platform: {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    connected: boolean;
    lastSync?: string;
    status?: 'active' | 'error' | 'pending';
  };
  onConnect: () => void;
  onDisconnect: () => void;
}

export function PlatformConnectionCard({ 
  platform, 
  onConnect, 
  onDisconnect
}: PlatformConnectionCardProps) {
  const Icon = platform.icon;

  const getStatusBadge = () => {
    if (!platform.connected) {
      return <Badge variant="outline">Not Connected</Badge>;
    }

    switch (platform.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!platform.connected) {
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }

    switch (platform.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${platform.color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{platform.name}</CardTitle>
              <CardDescription>{platform.description}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {getStatusIcon()}
          <span>
            {platform.connected 
              ? platform.lastSync 
                ? `Last synced: ${new Date(platform.lastSync).toLocaleDateString()}`
                : 'Connected'
              : 'Not connected'
            }
          </span>
        </div>

        <div className="flex space-x-2">
          {platform.connected ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDisconnect}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              className="gradient-primary" 
              size="sm" 
              onClick={onConnect}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
