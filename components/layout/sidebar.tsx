"use client";

import { useState } from "react";
import { TagManager } from "@/components/ui/tag-manager";
import { RecentEntries } from "@/components/ui/recent-entries";
import { Home, Search, Plus, Tag, PanelRightOpen, PanelRightClose } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onTagsUpdate?: () => void;
  refreshKey?: number;
  onEntrySelect?: (entryId: string) => void;
  selectedEntryId?: string;
  onToggleEntryList?: () => void;
  isEntryListCollapsed?: boolean;
}

export function Sidebar({ 
  currentView, 
  onViewChange, 
  onTagsUpdate, 
  refreshKey, 
  onEntrySelect,
  selectedEntryId,
  onToggleEntryList,
  isEntryListCollapsed = false
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // This would trigger real-time search in a complete implementation
    // For now, we'll just store the query
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onViewChange('search');
    }
  };

  return (
    <aside className="bg-gray-100 dark:bg-gray-800 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex-1 space-y-6">
        {/* Quick Navigation */}
        <div>
          <nav>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => onViewChange('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'dashboard' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Home size={16} />
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
                  <Search size={16} />
                  Advanced Search
                </button>
              </li>
              {onToggleEntryList && currentView === 'dashboard' && (
                <li>
                  <button 
                    onClick={onToggleEntryList}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={isEntryListCollapsed ? "Show Entry List" : "Hide Entry List"}
                  >
                    {isEntryListCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                    {isEntryListCollapsed ? "Show Entry List" : "Hide Entry List"}
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Quick Search */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Recently Accessed Entries */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <RecentEntries 
            refreshKey={refreshKey}
            onEntrySelect={(entryId) => {
              // First ensure we're in dashboard view
              if (currentView !== 'dashboard') {
                onViewChange('dashboard');
              }
              
              // If entry list is collapsed, expand it first
              if (isEntryListCollapsed && onToggleEntryList) {
                onToggleEntryList();
                // Small delay to allow layout to update
                setTimeout(() => {
                  if (onEntrySelect) {
                    onEntrySelect(entryId);
                  }
                }, 100);
              } else {
                // Select entry immediately if list is already expanded
                if (onEntrySelect) {
                  onEntrySelect(entryId);
                }
              }
            }}
            selectedEntryId={selectedEntryId}
          />
        </div>

        {/* Tag Management */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <TagManager key={refreshKey} onTagsUpdate={onTagsUpdate} refreshKey={refreshKey} />
        </div>
      </div>
    </aside>
  );
}
