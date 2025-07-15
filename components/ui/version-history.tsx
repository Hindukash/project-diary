"use client";

import { useState } from "react";
import { Entry, EntryHistory } from "@/data/types";
import { formatDateTime } from "@/lib/utils";
import { Modal } from "./modal";
import { History, Eye, RotateCcw, Calendar, User } from "lucide-react";

interface VersionHistoryProps {
  entry: Entry;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion?: (version: EntryHistory) => void;
}

export function VersionHistory({ entry, isOpen, onClose, onRestoreVersion }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<EntryHistory | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleRestoreVersion = (version: EntryHistory) => {
    if (confirm(`Are you sure you want to restore to version ${version.version}? This will create a new version with the restored content.`)) {
      onRestoreVersion?.(version);
      onClose();
    }
  };

  const handlePreviewVersion = (version: EntryHistory) => {
    setSelectedVersion(version);
    setIsPreviewOpen(true);
  };

  const currentVersion = {
    id: 'current',
    entryId: entry.id,
    title: entry.title,
    content: entry.content,
    updatedAt: entry.updatedAt,
    version: entry.version,
  };

  const allVersions = [currentVersion, ...entry.history].sort((a, b) => b.version - a.version);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Version History">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <History size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {entry.title}
            </h3>
          </div>

          {allVersions.length === 1 ? (
            <div className="text-center py-8">
              <History size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No version history available. This entry has only one version.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allVersions.map((version, index) => (
                <div
                  key={version.id}
                  className={`
                    p-4 rounded-lg border transition-colors
                    ${index === 0 
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${index === 0 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}>
                        v{version.version}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {version.title}
                          {index === 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} />
                          {formatDateTime(version.updatedAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreviewVersion(version)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        title="Preview this version"
                      >
                        <Eye size={16} />
                      </button>
                      {index !== 0 && (
                        <button
                          onClick={() => handleRestoreVersion(version)}
                          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                          title="Restore this version"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {version.content.slice(0, 150)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Version Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        title={`Version ${selectedVersion?.version} Preview`}
      >
        {selectedVersion && (
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {selectedVersion.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
                {formatDateTime(selectedVersion.updatedAt)}
                <span className="mx-2">•</span>
                <span>Version {selectedVersion.version}</span>
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">
                {selectedVersion.content}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              {selectedVersion.id !== 'current' && (
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleRestoreVersion(selectedVersion);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Restore This Version
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}