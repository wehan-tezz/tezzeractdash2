"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateSlug } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// Simple select component
const Select = ({ value, onChange, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    value={value}
    onChange={onChange}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </select>
);

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  products_services: string;
  objectives: string;
  website_url: string;
  created_at: string;
  updated_at: string;
  settings?: Record<string, unknown>;
}

export function OrganizationForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [objectives, setObjectives] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingOrganization, setExistingOrganization] = useState<Organization | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user's organizations from database
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!supabase) return;
      
      setLoadingOrgs(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user logged in');
          return;
        }

        console.log('🔍 Fetching organizations for user:', user.id);

        // Get organizations where user is a member
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        console.log('📋 Member data:', memberData);
        console.log('❌ Member error:', memberError);

        if (memberError) {
          console.error('Error fetching organization members:', memberError);
          console.log('Falling back to checking localStorage only');
          setOrganizations([]);
          setLoadingOrgs(false);
          return;
        }

        if (!memberData || memberData.length === 0) {
          console.log('⚠️ No organizations found for user - user needs to create one');
          setOrganizations([]);
          setLoadingOrgs(false);
          return;
        }

        const orgIds = memberData.map(m => m.organization_id);
        console.log('🆔 Organization IDs for user:', orgIds);

        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds)
          .order('created_at', { ascending: false });

        console.log('🏢 Organizations fetched:', data);
        console.log('❌ Organization fetch error:', error);

        if (error) {
          console.error('Error fetching organizations:', error);
          return;
        }

        if (data) {
          setOrganizations(data);
          
          // Check if there's one in localStorage and pre-select it
          const savedOrgData = localStorage.getItem('organization_data');
          if (savedOrgData) {
            const orgData = JSON.parse(savedOrgData);
            const foundOrg = data.find((org: Organization) => org.id === orgData.id);
            if (foundOrg) {
              setSelectedOrgId(foundOrg.id);
              loadOrganization(foundOrg);
            }
          } else if (data.length > 0) {
            // Auto-select the first organization if no localStorage data
            setSelectedOrgId(data[0].id);
            loadOrganization(data[0]);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Load organization data into form
  const loadOrganization = (org: Organization) => {
    setExistingOrganization(org);
    setName(org.name);
    setType(org.type);
    setProductsServices(org.products_services);
    setObjectives(org.objectives);
    setWebsiteUrl(org.website_url);
    setIsEditing(true);
    
    // Save to localStorage as well
    localStorage.setItem('organization_data', JSON.stringify(org));
  };

  // Handle organization selection from dropdown
  const handleOrganizationSelect = (orgId: string) => {
    setSelectedOrgId(orgId);
    
    if (orgId === 'new') {
      // Create new organization
      setExistingOrganization(null);
      setName('');
      setType('');
      setProductsServices('');
      setObjectives('');
      setWebsiteUrl('');
      setIsEditing(false);
    } else {
      // Load selected organization
      const org = organizations.find(o => o.id === orgId);
      if (org) {
        loadOrganization(org);
      }
    }
  };

  // Generate UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', { name, type, productsServices, objectives, websiteUrl });
    
    setLoading(true);
    setError('');

    try {
      const slug = generateSlug(name);
      console.log('Generated slug:', slug);
      
      // Store organization data in localStorage
      const organizationData = {
        id: existingOrganization?.id || generateUUID(), // Keep existing ID or generate new UUID
        name,
        slug,
        type,
        products_services: productsServices,
        objectives,
        website_url: websiteUrl,
        created_at: existingOrganization?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: {}
      };

      console.log('Storing organization data:', organizationData);
      
      // Save to localStorage
      localStorage.setItem('organization_data', JSON.stringify(organizationData));
      
      console.log('Organization data saved to localStorage successfully!');
      
      // Also save to database
      try {
        const response = await fetch('/api/organization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organization: organizationData })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Organization also saved to database!');
        } else {
          console.warn('Database save failed, but localStorage is updated:', result.message);
        }
      } catch (dbError) {
        console.error('Failed to save organization to database:', dbError);
        console.log('Organization is saved to localStorage only');
      }
      
      const action = isEditing ? 'updated' : 'created';
      alert(`Organization ${action} successfully!`);
      
      // Update local state
      setExistingOrganization(organizationData);
      setIsEditing(true);
      
      // Refresh organizations list if saved to database
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get organizations where user is a member
          const { data: memberData } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id);

          if (memberData && memberData.length > 0) {
            const orgIds = memberData.map(m => m.organization_id);
            
            const { data } = await supabase
              .from('organizations')
              .select('*')
              .in('id', orgIds)
              .order('created_at', { ascending: false });
            
            if (data) {
              setOrganizations(data);
              setSelectedOrgId(organizationData.id);
            }
          }
        }
      }
      
      // Don't redirect - stay on the page to show the updated org
      // router.push('/dashboard');
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gradient">
          {isEditing ? 'Organization Profile' : 'Create Organization'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update your organization profile' : 'Set up your organization profile to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Organization Selector */}
        {organizations.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/30 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <Label htmlFor="org-select" className="text-lg font-bold text-foreground">
                  Your Organizations
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select an organization to edit or create a new one
                </p>
              </div>
            </div>
            
            <select
              id="org-select"
              value={selectedOrgId}
              onChange={(e) => handleOrganizationSelect(e.target.value)}
              disabled={loadingOrgs}
              className="w-full h-12 px-4 rounded-lg border-2 border-primary/30 bg-background text-foreground font-medium shadow-sm hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" className="text-muted-foreground">Choose an organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id} className="py-2">
                  🏢 {org.name} • {org.type}
                </option>
              ))}
              <option value="new" className="font-bold py-2">
                ➕ Create New Organization
              </option>
            </select>
            
            {loadingOrgs && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading your organizations...</span>
              </div>
            )}
            
            {organizations.length > 0 && !loadingOrgs && (
              <p className="text-xs text-muted-foreground mt-3">
                📊 {organizations.length} organization{organizations.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Organization Type *</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Select organization type</option>
                <option value="startup">Startup</option>
                <option value="small_business">Small Business</option>
                <option value="medium_business">Medium Business</option>
                <option value="enterprise">Enterprise</option>
                <option value="non_profit">Non-Profit</option>
                <option value="agency">Agency</option>
                <option value="freelancer">Freelancer</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://your-website.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Products/Services *</Label>
            <textarea
              id="products"
              placeholder="Describe what your organization offers..."
              value={productsServices}
              onChange={(e) => setProductsServices(e.target.value)}
              required
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Organization Objectives *</Label>
            <textarea
              id="objectives"
              placeholder="What are your main business objectives and goals?"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              required
              rows={4}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full gradient-primary" 
              disabled={loading}
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Organization' : 'Create Organization')}
            </Button>
            
            {isEditing && (
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (confirm('Are you sure you want to create a new organization? This will replace your current organization data.')) {
                    // Clear form
                    setName('');
                    setType('');
                    setProductsServices('');
                    setObjectives('');
                    setWebsiteUrl('');
                    setExistingOrganization(null);
                    setIsEditing(false);
                  }
                }}
              >
                Create New Organization
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
