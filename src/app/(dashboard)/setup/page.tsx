"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Building2, 
  Target, 
  BarChart3,
  Users
} from 'lucide-react';
import { PlatformConnectionCard } from '@/components/setup/platform-connection-card';
import { OrganizationForm } from '@/components/organization-form';
import { ObjectivesManager } from '@/components/setup/objectives-manager';
import { getToken, setToken, removeToken, isPlatformConnected, cleanupExpiredTokens, handleAuthError } from '@/lib/token-manager';

interface GoogleProperty {
  propertyId: string;
  displayName: string;
  name?: string;
  accountName?: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  category?: string;
  tasks?: string[];
}

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState('platforms');
  const [googleProperties, setGoogleProperties] = useState<GoogleProperty[]>([]);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<GoogleProperty | null>(null);
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([]);
  const [showFacebookPageSelector, setShowFacebookPageSelector] = useState(false);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({
    google_analytics: false,
    facebook: false,
    twitter: false,
    youtube: false,
  });

  const fetchGoogleProperties = async (accessToken: string, showModal = false) => {
    try {
      const response = await fetch(`/api/integrations/google-analytics/properties?access_token=${encodeURIComponent(accessToken)}`);
      if (response.ok) {
        const data = await response.json();
        setGoogleProperties(data.properties || []);
        
        // Show modal if requested (after fresh connection)
        if (showModal && data.properties && data.properties.length > 0) {
          setShowPropertySelector(true);
        }
      } else if (response.status === 401) {
        // Token is invalid or expired, disconnect
        console.log('Google Analytics token expired or invalid, disconnecting...');
        handleAuthError('google_analytics_tokens');
        setConnectedPlatforms(prev => ({ ...prev, google_analytics: false }));
        setGoogleAccessToken(null);
      } else {
        console.error('Failed to fetch Google properties:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching Google properties:', error);
    }
  };

  const fetchFacebookPages = async (accessToken: string, showModal = false) => {
    try {
      const response = await fetch(`/api/integrations/meta/pages?access_token=${encodeURIComponent(accessToken)}`);
      if (response.ok) {
        const data = await response.json();
        setFacebookPages(data.pages || []);
        
        // Show modal if requested (after fresh connection)
        if (showModal && data.pages && data.pages.length > 0) {
          setShowFacebookPageSelector(true);
        }
      } else if (response.status === 401) {
        // Token is invalid or expired, disconnect
        console.log('Meta token expired or invalid, disconnecting...');
        handleAuthError('meta_tokens');
        setConnectedPlatforms(prev => ({ ...prev, facebook: false }));
      } else {
        console.error('Failed to fetch Facebook pages:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching Facebook pages:', error);
    }
  };

  const handlePropertySelect = (property: GoogleProperty) => {
    setSelectedProperty(property);
    
    // Save the selected property to localStorage
    localStorage.setItem('google_analytics_selected_property', JSON.stringify(property));
    
    // Close the modal
    setShowPropertySelector(false);
    
    // You can also save to database here if needed
    console.log('Selected property:', property);
  };

  const handleFacebookPageSelect = (page: FacebookPage) => {
    setSelectedFacebookPage(page);
    
    // Save the selected page to localStorage
    localStorage.setItem('meta_selected_page', JSON.stringify(page));
    localStorage.setItem('meta_selected_page_id', page.id);
    
    // Close the modal
    setShowFacebookPageSelector(false);
    
    console.log('Selected Facebook page:', page);
  };

  const handleDisconnect = (platformId: string) => {
    // Remove tokens using token manager
    const tokenKeys: Record<string, 'google_analytics_tokens' | 'meta_tokens' | 'twitter_tokens' | 'youtube_tokens'> = {
      google_analytics: 'google_analytics_tokens',
      facebook: 'meta_tokens',
      twitter: 'twitter_tokens',
      youtube: 'youtube_tokens',
    };

    const tokenKey = tokenKeys[platformId];
    if (tokenKey) {
      removeToken(tokenKey);
      
      // Remove additional data for Google Analytics
      if (platformId === 'google_analytics') {
        setGoogleAccessToken(null);
        setSelectedProperty(null);
        setGoogleProperties([]);
      }

      // Remove additional data for Facebook
      if (platformId === 'facebook') {
        localStorage.removeItem('meta_selected_page');
        localStorage.removeItem('meta_selected_page_id');
        setSelectedFacebookPage(null);
        setFacebookPages([]);
      }

      // Update connection status
      setConnectedPlatforms(prev => ({ ...prev, [platformId]: false }));
      
      console.log(`Disconnected from ${platformId}`);
    }
  };

  useEffect(() => {
    // Clean up expired tokens on mount
    cleanupExpiredTokens();
    
    // Check connection status for all platforms using token manager
    const checkConnections = () => {
      const connections: Record<string, boolean> = {
        google_analytics: isPlatformConnected('google_analytics_tokens'),
        facebook: isPlatformConnected('meta_tokens'),
        twitter: isPlatformConnected('twitter_tokens'),
        youtube: isPlatformConnected('youtube_tokens'),
      };
      setConnectedPlatforms(connections);
    };

    // Check if we have tokens from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const tokensParam = urlParams.get('tokens');
    const successParam = urlParams.get('success');
    const platformParam = urlParams.get('platform'); // 'google_analytics' or 'youtube'
    
    if (tokensParam) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        if (tokens.access_token) {
          // Determine which platform this is
          let connectedPlatform = platformParam || 'google_analytics'; // Default to GA for backwards compatibility
          
          // Check success param to determine platform
          if (successParam === 'meta_connected') {
            connectedPlatform = 'facebook';
          } else if (successParam === 'twitter_connected') {
            connectedPlatform = 'twitter';
          }
          
          // Store in localStorage with correct key using token manager
          let tokenKey: 'google_analytics_tokens' | 'youtube_tokens' | 'meta_tokens' | 'twitter_tokens' = 'google_analytics_tokens';
          if (connectedPlatform === 'youtube') {
            tokenKey = 'youtube_tokens';
          } else if (connectedPlatform === 'facebook') {
            tokenKey = 'meta_tokens';
          } else if (connectedPlatform === 'twitter') {
            tokenKey = 'twitter_tokens';
          }
          
          setToken(tokenKey, tokens);
          
          // Update connection status
          setConnectedPlatforms(prev => ({ ...prev, [connectedPlatform]: true }));
          
          // Fetch properties/pages based on platform
          if (connectedPlatform === 'google_analytics') {
            setGoogleAccessToken(tokens.access_token);
            const isNewConnection = successParam === 'google_connected';
            fetchGoogleProperties(tokens.access_token, isNewConnection);
          } else if (connectedPlatform === 'facebook') {
            const isNewConnection = successParam === 'meta_connected';
            fetchFacebookPages(tokens.access_token, isNewConnection);
          }
          
          // Clean up URL
          const newUrl = window.location.pathname + window.location.search
            .replace(/[?&]tokens=[^&]+/, '')
            .replace(/[?&]success=[^&]+/, '')
            .replace(/[?&]platform=[^&]+/, '')
            .replace(/^&/, '?')
            .replace(/\?$/, '');
          window.history.replaceState({}, '', newUrl || window.location.pathname);
        }
      } catch (error) {
        console.error('Error parsing tokens:', error);
      }
    } else {
      // Check localStorage for existing tokens using token manager
      const tokens = getToken('google_analytics_tokens');
      if (tokens && tokens.access_token) {
        setGoogleAccessToken(tokens.access_token);
        fetchGoogleProperties(tokens.access_token, false);
      }
      
      // Load previously selected property
      const storedProperty = localStorage.getItem('google_analytics_selected_property');
      if (storedProperty) {
        try {
          setSelectedProperty(JSON.parse(storedProperty));
        } catch (error) {
          console.error('Error parsing stored property:', error);
        }
      }

      // Check localStorage for Facebook tokens and fetch pages using token manager
      const metaTokens = getToken('meta_tokens');
      if (metaTokens && metaTokens.access_token) {
        fetchFacebookPages(metaTokens.access_token, false);
      }

      // Load previously selected Facebook page
      const storedPage = localStorage.getItem('meta_selected_page');
      if (storedPage) {
        try {
          setSelectedFacebookPage(JSON.parse(storedPage));
        } catch (error) {
          console.error('Error parsing stored Facebook page:', error);
        }
      }
    }

    // Check all connections
    checkConnections();
  }, []);

  const tabs = [
    { id: 'platforms', label: 'Platform Connections', icon: BarChart3 },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'objectives', label: 'Objectives', icon: Target },
  ];

  const platforms = [
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Track website traffic and user behavior',
      icon: BarChart3,
      color: 'bg-blue-500',
      connected: connectedPlatforms.google_analytics,
    },
    {
      id: 'youtube',
      name: 'YouTube Analytics',
      description: 'Track your YouTube channel performance',
      icon: Users,
      color: 'bg-red-600',
      connected: connectedPlatforms.youtube,
    },
    {
      id: 'facebook',
      name: 'Meta (Facebook & Instagram)',
      description: 'Manage Facebook and Instagram content',
      icon: Users,
      color: 'bg-blue-600',
      connected: connectedPlatforms.facebook,
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Track Twitter engagement and metrics',
      icon: Users,
      color: 'bg-black',
      connected: connectedPlatforms.twitter,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'platforms':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Platforms</h2>
              <p className="text-gray-600">
                Connect your social media and analytics platforms to start tracking performance.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {platforms.map((platform) => (
                <PlatformConnectionCard
                  key={platform.id}
                  platform={platform}
                  onConnect={async () => {
                    try {
                      const response = await fetch(`/api/integrations/oauth-url?platform=${platform.id}`);
                      if (response.ok) {
                        const data = await response.json();
                        window.location.href = data.oauthUrl;
                      } else {
                        console.error('Failed to get OAuth URL:', await response.text());
                      }
                    } catch (error) {
                      console.error('Error connecting to platform:', error);
                    }
                  }}
                  onDisconnect={() => {
                    handleDisconnect(platform.id);
                  }}
                />
              ))}
            </div>

            {selectedProperty && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">Selected Google Analytics Property</CardTitle>
                  <CardDescription className="text-green-700">
                    Currently using this property for data collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-white">
                    <div>
                      <p className="font-medium text-gray-900">{selectedProperty.displayName}</p>
                      <p className="text-sm text-gray-600">{selectedProperty.accountName}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowPropertySelector(true)}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedFacebookPage && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Selected Facebook Page</CardTitle>
                  <CardDescription className="text-blue-700">
                    Currently using this page for posting content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-white">
                    <div>
                      <p className="font-medium text-gray-900">{selectedFacebookPage.name}</p>
                      {selectedFacebookPage.category && (
                        <p className="text-sm text-gray-600">{selectedFacebookPage.category}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowFacebookPageSelector(true)}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Setup</h2>
              <p className="text-gray-600">
                Set up your organization details to personalize content suggestions.
              </p>
            </div>
            <OrganizationForm />
          </div>
        );

      case 'objectives':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Objectives</h2>
              <p className="text-gray-600">
                Define your content marketing objectives to get better AI suggestions.
              </p>
            </div>
            <ObjectivesManager />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup</h1>
          <p className="text-gray-600">
            Complete your setup to start using the dashboard effectively.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Google Analytics Property Selector Modal */}
      {showPropertySelector && googleProperties.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Google Analytics Property</h2>
                  <p className="text-gray-600 mt-1">
                    Choose which property to use for tracking analytics data
                  </p>
                </div>
                <button
                  onClick={() => setShowPropertySelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="space-y-3">
                {googleProperties.map((property) => (
                  <button
                    key={property.propertyId}
                    onClick={() => handlePropertySelect(property)}
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900 group-hover:text-blue-900">
                        {property.displayName}
                      </p>
                      <p className="text-sm text-gray-500 group-hover:text-blue-700">
                        {property.accountName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Property ID: {property.propertyId}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowPropertySelector(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Page Selector Modal */}
      {showFacebookPageSelector && facebookPages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Facebook Page</h2>
                  <p className="text-gray-600 mt-1">
                    Choose which Facebook Page to use for posting content
                  </p>
                </div>
                <button
                  onClick={() => setShowFacebookPageSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="space-y-3">
                {facebookPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleFacebookPageSelect(page)}
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900 group-hover:text-blue-900">
                        {page.name}
                      </p>
                      {page.category && (
                        <p className="text-sm text-gray-500 group-hover:text-blue-700">
                          {page.category}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Page ID: {page.id}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowFacebookPageSelector(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}