"use client";

import { useState } from "react";
import { Entry } from "@/data/types";
import { Modal } from "./modal";
import { 
  ExportOptions, 
  exportEntry, 
  exportMultipleEntries, 
  downloadFile, 
  getExportFilename, 
  getExportFilenameMultiple, 
  getMimeType 
} from "@/lib/export";
import { Download, FileText, Code, File } from "lucide-react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: Entry;
  entries?: Entry[];
  title?: string;
}

export function ExportDialog({ isOpen, onClose, entry, entries, title }: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'markdown',
    includeImages: true,
    includeTags: true,
    includeMetadata: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const isMultipleEntries = entries && entries.length > 0;
  const exportTitle = title || (isMultipleEntries ? `Export ${entries.length} Entries` : `Export Entry`);

  const handleExport = async () => {
    if (!entry && !entries) return;
    
    setIsExporting(true);
    
    try {
      let content: string;
      let filename: string;
      
      if (isMultipleEntries) {
        content = exportMultipleEntries(entries, options);
        filename = getExportFilenameMultiple(options.format, entries.length);
      } else if (entry) {
        content = exportEntry(entry, options);
        filename = getExportFilename(entry, options.format);
      } else {
        return;
      }
      
      const mimeType = getMimeType(options.format);
      downloadFile(content, filename, mimeType);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: 'markdown', label: 'Markdown', icon: FileText, description: 'Export as Markdown (.md)' },
    { value: 'json', label: 'JSON', icon: Code, description: 'Export as JSON (.json)' },
    { value: 'txt', label: 'Plain Text', icon: File, description: 'Export as plain text (.txt)' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exportTitle}>
      <div className="p-6 space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 gap-3">
            {formatOptions.map((format) => (
              <label
                key={format.value}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={options.format === format.value}
                  onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                  className="sr-only"
                />
                <div className="flex items-center flex-1">
                  <div className={`
                    w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                    ${options.format === format.value 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}>
                    {options.format === format.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <format.icon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {format.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format.description}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Include in Export
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Metadata (dates, version)
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeTags}
                onChange={(e) => setOptions({ ...options, includeTags: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Tags
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeImages}
                onChange={(e) => setOptions({ ...options, includeImages: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Images
              </span>
            </label>
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isMultipleEntries ? (
              <p>Exporting {entries.length} entries to {options.format.toUpperCase()} format.</p>
            ) : (
              <p>Exporting &quot;{entry?.title}&quot; to {options.format.toUpperCase()} format.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </Modal>
  );
}