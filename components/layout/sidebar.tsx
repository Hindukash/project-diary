"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TagManager } from "@/components/ui/tag-manager";
import { Home, Search, Settings } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onTagsUpdate?: () => void;
  refreshKey?: number;
}

export function Sidebar({ currentView, onViewChange, onTagsUpdate, refreshKey }: SidebarProps) {
  return (
    <aside className="bg-gray-100 dark:bg-gray-800 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">Project Diary</h1>
          <nav>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onViewChange('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'dashboard' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Home size={18} />
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onViewChange('search')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'search' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Search size={18} />
                  Search
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onViewChange('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'settings' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Settings size={18} />
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <TagManager key={refreshKey} onTagsUpdate={onTagsUpdate} refreshKey={refreshKey} />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">User Profile</div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
