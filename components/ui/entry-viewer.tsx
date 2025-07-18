"use client";

import { useState, useEffect } from "react";
import { Entry } from "@/data/types";
import { updateEntry, deleteEntry } from "@/lib/entries";
import { formatDateTime } from "@/lib/utils";
import { getTagByName } from "@/lib/tags";
import { EntryHistory } from "@/data/types";
import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "./image-upload";
import { ExportDialog } from "./export-dialog";
import { VersionHistory } from "./version-history";
import { ImageModal } from "./image-modal";
import { Edit, Calendar, Tag, Eye, Save, X, Download, MoreHorizontal, History, Trash2, Plus, Sparkles } from "lucide-react";

// Helper component to display a tag with async color loading
function TagDisplay({ tagName }: { tagName: string }) {
  const [tagColor, setTagColor] = useState('#3B82F6');
  
  useEffect(() => {
    const loadTag = async () => {
      try {
        const tag = await getTagByName(tagName);
        if (tag) {
          setTagColor(tag.color);
        }
      } catch (error) {
        console.error('Failed to load tag:', error);
      }
    };
    loadTag();
  }, [tagName]);
  
  return (
    <span
      className="px-3 py-1 text-sm rounded-full text-white"
      style={{ 
        backgroundColor: tagColor,
        color: 'white'
      }}
    >
      {tagName}
    </span>
  );
}

interface EntryViewerProps {
  selectedEntry?: Entry | null;
  onEntryUpdate?: () => void;
  isEntryListCollapsed?: boolean;
  onCreateEntry?: () => void;
}

export function EntryViewer({ selectedEntry = null, onEntryUpdate, isEntryListCollapsed = false, onCreateEntry }: EntryViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);


  useEffect(() => {
    if (selectedEntry) {
      setEditTitle(selectedEntry.title);
      setEditContent(selectedEntry.content);
      setEditTags(selectedEntry.tags);
      setEditImages(selectedEntry.images || []);
    }
  }, [selectedEntry]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (selectedEntry) {
      try {
        await updateEntry(selectedEntry.id, {
          title: editTitle,
          content: editContent,
          tags: editTags,
          images: editImages,
        });
        onEntryUpdate?.();
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update entry:', error);
      }
    }
  };

  const handleCancel = () => {
    if (selectedEntry) {
      setEditTitle(selectedEntry.title);
      setEditContent(selectedEntry.content);
      setEditTags(selectedEntry.tags);
      setEditImages(selectedEntry.images || []);
    }
    setIsEditing(false);
  };

  const handleRestoreVersion = async (version: EntryHistory) => {
    if (selectedEntry) {
      try {
        await updateEntry(selectedEntry.id, {
          title: version.title,
          content: version.content,
          // Keep current tags and images as they weren't in the history
          tags: selectedEntry.tags,
          images: selectedEntry.images,
        });
        onEntryUpdate?.();
      } catch (error) {
        console.error('Failed to restore version:', error);
      }
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) {
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${selectedEntry.title}"? This action cannot be undone.`)) {
      try {
        const success = await deleteEntry(selectedEntry.id);
        
        if (success) {
          onEntryUpdate?.();
        } else {
          alert('Failed to delete entry. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  if (!selectedEntry) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              No Entry Selected
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {isEntryListCollapsed 
                ? "Ready to capture your thoughts? Create your first entry!" 
                : "Select an entry from the list to view its content, or create a new entry to get started."
              }
            </p>
            
            {/* Cool Add Entry Button when collapsed */}
            {isEntryListCollapsed && onCreateEntry && (
              <button
                onClick={onCreateEntry}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 mb-6"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <Plus size={20} />
                </div>
                <span className="text-lg">Create New Entry</span>
                <Sparkles className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                
                {/* Animated shine effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </button>
            )}
            
            <div className="text-sm text-gray-400 dark:text-gray-500">
              <p>• Create entries with rich text and images</p>
              <p>• Organize with tags and categories</p>
              <p>• Search and filter your content</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 h-full overflow-y-auto relative">
      {/* Floating Add Entry Button when list is collapsed */}
      {isEntryListCollapsed && onCreateEntry && (
        <button
          onClick={onCreateEntry}
          className="fixed bottom-8 right-8 group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-50"
          title="Create New Entry"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>
        </button>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {selectedEntry.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Updated: {formatDateTime(selectedEntry.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>Version {selectedEntry.version}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
              >
                <Edit size={16} />
                Edit
              </button>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
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
                      Export Entry
                    </button>
                    <button
                      onClick={() => {
                        setIsVersionHistoryOpen(true);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <History size={16} />
                      Version History
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMoreMenu(false);
                        setTimeout(() => {
                          handleDeleteEntry();
                        }, 50);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete Entry
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedEntry.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Tag size={16} className="text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {selectedEntry.tags.map((tagName, index) => (
              <TagDisplay key={index} tagName={tagName} />
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {selectedEntry.images && selectedEntry.images.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedEntry.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity hover:scale-105"
                onClick={() => {
                  setSelectedImage({ url: image, alt: `Image ${index + 1}` });
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <RichTextEditor
                value={editContent}
                onChange={setEditContent}
                placeholder="Write your entry content here..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Images
              </label>
              <ImageUpload
                images={editImages}
                onImagesChange={setEditImages}
                maxImages={5}
              />
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {selectedEntry.content}
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        entry={selectedEntry}
      />

      {/* Version History Dialog */}
      <VersionHistory
        entry={selectedEntry}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          alt={selectedImage.alt}
        />
      )}
    </div>
  );
}