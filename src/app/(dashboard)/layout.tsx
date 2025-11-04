"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Settings, 
  Calendar, 
  Lightbulb, 
  Plug,
  Moon,
  Sun,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { disconnectAllPlatforms } from '@/lib/token-manager';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Digital Setup', href: '/setup', icon: Plug },
  { name: 'Content Suggestions', href: '/suggestions', icon: Lightbulb },
  { name: 'Content Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    if (!supabase) {
      console.error('Supabase client not initialized');
      setLoading(false);
      router.push('/login');
      return;
    }
    
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      // Redirect to login if not authenticated
      if (!user) {
        router.push('/login');
      }
    };
    
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      // Disconnect all platforms (removes all tokens)
      disconnectAllPlatforms();
      
      // Clear all localStorage data
      localStorage.clear();
      
      // Sign out from Supabase
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect even if there's an error
      window.location.href = '/login';
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.user_metadata?.full_name || user.email || '';
    return name.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black opacity-100">
      {/* Top Navigation */}
      <nav className="border-b bg-white dark:bg-black border-black dark:border-white sticky top-0 z-40 opacity-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gradient animate-fade-in">Tezzeract Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="focus-ring"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    {user?.user_metadata?.avatar_url ? (
                      <Image 
                        width={32}
                        height={32}
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md shadow-lg z-50 opacity-100">
                    <div className="p-3 border-b-2 border-black dark:border-white bg-white dark:bg-black">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-black border-r border-black dark:border-white min-h-screen hidden lg:block opacity-100">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
