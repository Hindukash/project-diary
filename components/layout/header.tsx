"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Settings, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSettingsClick: () => void;
  onProfileClick?: () => void;
  currentView?: string;
}

export function Header({ onSettingsClick, onProfileClick, currentView }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    onProfileClick?.();
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Project Diary
        </h1>
        {user && (
          <div className="ml-4 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
              v0.0.4
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {user && (
          <button
            onClick={onSettingsClick}
            className={cn(
              "p-2 rounded-lg transition-colors",
              currentView === 'settings'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        )}
        
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {profile?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </span>
              </div>
              <ChevronDown size={16} />
            </button>
            
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>
                  <hr className="border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </header>
  );
}