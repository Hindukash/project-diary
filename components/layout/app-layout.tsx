"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { ContentListPanel } from "./content-list-panel";
import { Entry } from "@/data/types";
import { getAllEntries, getEntryById, addToRecentlyAccessed, createEntry } from "@/lib/entries";

// Import EntryViewer component
import { EntryViewer } from "../ui/entry-viewer";
import { AdvancedSearch } from "../ui/advanced-search";
import { TagManager } from "../ui/tag-manager";
import { ThemeToggle } from "../ui/theme-toggle";
import { Modal } from "../ui/modal";
import { EntryForm } from "../ui/entry-form";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isEntryListCollapsed, setIsEntryListCollapsed] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Initialize with first entry on mount
  useEffect(() => {
    const entries = getAllEntries();
    if (entries.length > 0) {
      setSelectedEntryId(entries[0].id);
      addToRecentlyAccessed(entries[0].id);
    }
  }, []);

  // Update selected entry when entries change
  useEffect(() => {
    const entries = getAllEntries();
    if (entries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(entries[0].id);
      addToRecentlyAccessed(entries[0].id);
    }
  }, [refreshKey]);

  useEffect(() => {
    if (selectedEntryId) {
      const entry = getEntryById(selectedEntryId);
      setSelectedEntry(entry || null);
    }
  }, [selectedEntryId, refreshKey]);

  const handleEntrySelect = (entryId: string) => {
    setSelectedEntryId(entryId);
    addToRecentlyAccessed(entryId);
  };

  const handleEntriesUpdate = () => {
    setRefreshKey(prev => prev + 1);
    // Check if the currently selected entry still exists
    setTimeout(() => {
      if (selectedEntryId && !getEntryById(selectedEntryId)) {
        const entries = getAllEntries();
        if (entries.length > 0) {
          setSelectedEntryId(entries[0].id);
          addToRecentlyAccessed(entries[0].id);
        } else {
          setSelectedEntryId(null);
        }
      }
    }, 100);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const toggleEntryList = () => {
    setIsEntryListCollapsed(!isEntryListCollapsed);
  };

  const handleCreateEntry = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveEntry = (data: { title: string; content: string; tags: string[]; images: string[] }) => {
    const newEntry = createEntry(data.title, data.content, data.tags, data.images);
    handleEntriesUpdate(); // Refresh entries
    handleEntrySelect(newEntry.id); // Select the newly created entry
    setIsCreateModalOpen(false);
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex h-full overflow-hidden">
            <div className={`transition-all duration-300 border-r border-gray-200 dark:border-gray-700 ${
              isEntryListCollapsed ? 'w-0 opacity-0' : 'w-2/5 opacity-100'
            }`}>
              {!isEntryListCollapsed && (
                <ContentListPanel
                  selectedEntry={selectedEntryId}
                  onEntrySelect={handleEntrySelect}
                  onEntriesUpdate={handleEntriesUpdate}
                  refreshKey={refreshKey}
                  onToggleEntryList={toggleEntryList}
                />
              )}
            </div>
            <div className={`flex-1 p-4 transition-all duration-300 ${
              isEntryListCollapsed ? 'w-full' : 'w-3/5'
            }`}>
              <EntryViewer
                selectedEntry={selectedEntry}
                onEntryUpdate={handleEntriesUpdate}
                isEntryListCollapsed={isEntryListCollapsed}
                onCreateEntry={handleCreateEntry}
              />
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="p-4">
            <AdvancedSearch 
              onEntrySelect={handleEntrySelect}
              selectedEntryId={selectedEntryId || undefined}
              onViewChange={handleViewChange}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 h-full">
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Settings</h1>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Application Settings</h2>
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Theme Preferences</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Choose your preferred theme for the application interface.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm">🌙</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Theme Mode
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Switch between light and dark appearance
                            </p>
                          </div>
                          <div className="ml-4">
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Tags</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Create, edit, and delete tags to organize your entries.
                      </p>
                      <div className="mt-4">
                        <TagManager 
                          onTagsUpdate={handleEntriesUpdate}
                        />
                      </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Export & Import</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Export your diary entries to PDF or Markdown format, or import from other sources.
                      </p>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Export All Entries
                      </button>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Data Management</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Manage your diary data, including backup and restore options.
                      </p>
                      <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                        Backup Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        onSettingsClick={() => handleViewChange('settings')}
        currentView={currentView}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[300px] border-r border-gray-200 dark:border-gray-700">
          <Sidebar 
            currentView={currentView}
            onViewChange={handleViewChange}
            onTagsUpdate={handleEntriesUpdate}
            refreshKey={refreshKey}
            onEntrySelect={handleEntrySelect}
            selectedEntryId={selectedEntryId || undefined}
            onToggleEntryList={toggleEntryList}
            isEntryListCollapsed={isEntryListCollapsed}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      {/* Create Entry Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCancelCreate}
        title="Create New Entry"
      >
        <EntryForm
          onSave={handleSaveEntry}
          onCancel={handleCancelCreate}
        />
      </Modal>
    </div>
  );
}