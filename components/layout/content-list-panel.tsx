"use client";

import { useState, useEffect, useCallback } from "react";
import { EntryCard } from "@/components/ui/entry-card";
import { Modal } from "@/components/ui/modal";
import { EntryForm } from "@/components/ui/entry-form";
import { SearchFiltersComponent } from "@/components/ui/search-filters";
import { ExportDialog } from "@/components/ui/export-dialog";
import { Entry, SearchFilters } from "@/data/types";
import { getAllEntries, createEntry, searchEntries } from "@/lib/entries";
import { Plus, Download, MoreHorizontal, PanelLeftClose } from "lucide-react";

interface ContentListPanelProps {
  selectedEntry: string | null;
  onEntrySelect: (entryId: string) => void;
  onEntriesUpdate: () => void;
  refreshKey: number;
  onToggleEntryList?: () => void;
}

export function ContentListPanel({ selectedEntry, onEntrySelect, onEntriesUpdate, refreshKey, onToggleEntryList }: ContentListPanelProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const loadEntries = useCallback(async () => {
    console.log('🔄 ContentListPanel: loadEntries called with filters:', filters);
    try {
      console.log('📞 ContentListPanel: Calling searchEntries...');
      const filteredEntries = await searchEntries(filters);
      console.log('✅ ContentListPanel: searchEntries returned:', filteredEntries);
      setEntries(filteredEntries);
    } catch (error) {
      console.error('❌ ContentListPanel: Failed to load entries:', error);
      setEntries([]);
    }
  }, [filters, refreshKey]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleCreateEntry = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveEntry = async (data: { title: string; content: string; tags: string[]; images: string[] }) => {
    try {
      const newEntry = await createEntry(data.title, data.content, data.tags, data.images);
      loadEntries(); // Refresh local entries
      onEntriesUpdate(); // Notify parent components
      onEntrySelect(newEntry.id); // Select the newly created entry
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <section className="bg-gray-200 dark:bg-gray-700 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Entries</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCreateEntry}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            title="Create new entry"
          >
            <Plus size={16} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    setIsExportDialogOpen(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download size={16} />
                  Export All ({entries.length})
                </button>
              </div>
            )}
          </div>
          
          {onToggleEntryList && (
            <button
              onClick={onToggleEntryList}
              className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Hide entry list"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <SearchFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <div className="flex-grow overflow-y-auto p-2">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No entries found</p>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isSelected={selectedEntry === entry.id}
              onClick={() => onEntrySelect(entry.id)}
            />
          ))
        )}
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

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        entries={entries}
        title={`Export ${entries.length} Entries`}
      />
    </section>
  );
}
