"use client";

import { useState, useEffect } from "react";
import { Entry } from "@/data/types";
import { getRecentlyAccessedEntries } from "@/lib/entries";
import { formatDateTime } from "@/lib/utils";
import { Clock, FileText } from "lucide-react";

interface RecentEntriesProps {
  refreshKey?: number;
  onEntrySelect: (entryId: string) => void;
  selectedEntryId?: string;
}

export function RecentEntries({ refreshKey, onEntrySelect, selectedEntryId }: RecentEntriesProps) {
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const loadRecentEntries = async () => {
      try {
        const entries = await getRecentlyAccessedEntries();
        setRecentEntries(entries);
      } catch (error) {
        console.error('Failed to load recent entries:', error);
        setRecentEntries([]);
      }
    };
    loadRecentEntries();
  }, [refreshKey]);

  if (recentEntries.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent entries</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <Clock size={14} />
        Recently Accessed
      </h3>
      <div className="space-y-1">
        {recentEntries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onEntrySelect(entry.id)}
            className={`w-full text-left p-2 rounded-md transition-all duration-200 ${
              selectedEntryId === entry.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500 ring-opacity-50'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105'
            }`}
          >
            <div className="flex items-start gap-2">
              <FileText size={14} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(entry.updatedAt)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}