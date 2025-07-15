"use client";

import { useState } from "react";
import { SearchFilters } from "@/data/types";
import { getAllTags } from "@/lib/tags";
import { Search, Filter, X, Calendar, Tag, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export function SearchFiltersComponent({ filters, onFiltersChange, className }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("");
  
  const availableTags = getAllTags();
  const selectedTags = filters.tags || [];

  const handleQueryChange = (query: string) => {
    onFiltersChange({ ...filters, query });
  };

  const handleTagToggle = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleTimePeriodChange = (period: string) => {
    setSelectedTimePeriod(period);
    
    if (!period) {
      onFiltersChange({ 
        ...filters, 
        dateFrom: undefined,
        dateTo: undefined 
      });
      return;
    }

    const now = new Date();
    let dateFrom: Date;
    
    switch (period) {
      case '7days':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        dateFrom = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        break;
      case '12months':
        dateFrom = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(0); // All time
    }

    onFiltersChange({ 
      ...filters, 
      dateFrom,
      dateTo: now
    });
  };

  const toggleSortOrder = () => {
    const newOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFiltersChange({ ...filters, sortOrder: newOrder });
  };

  const clearFilters = () => {
    setSelectedTimePeriod("");
    onFiltersChange({
      query: "",
      tags: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters = !!(filters.query || selectedTags.length > 0 || filters.dateFrom || filters.dateTo);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search entries..."
          value={filters.query || ""}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Toggle and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Filter size={16} />
            <span>{isExpanded ? "Hide Filters" : "Show Filters"}</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {[filters.query, ...(selectedTags || []), selectedTimePeriod].filter(Boolean).length}
              </span>
            )}
          </button>
          
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            title={filters.sortOrder === 'desc' ? 'Sort oldest first' : 'Sort newest first'}
          >
            {filters.sortOrder === 'desc' ? (
              <ArrowDown size={16} />
            ) : (
              <ArrowUp size={16} />
            )}
            <span>
              {filters.sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </span>
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.name)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors",
                    selectedTags.includes(tag.name)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Time Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Time Period
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTimePeriodChange("")}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  selectedTimePeriod === ""
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                All time
              </button>
              <button
                onClick={() => handleTimePeriodChange("7days")}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  selectedTimePeriod === "7days"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                Last week
              </button>
              <button
                onClick={() => handleTimePeriodChange("30days")}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  selectedTimePeriod === "30days"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                Last month
              </button>
              <button
                onClick={() => handleTimePeriodChange("6months")}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  selectedTimePeriod === "6months"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                Last 6 months
              </button>
              <button
                onClick={() => handleTimePeriodChange("12months")}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  selectedTimePeriod === "12months"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                Last year
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}