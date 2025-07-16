"use client";

import { useState, useEffect } from "react";
import { Entry, SearchFilters } from "@/data/types";
import { searchEntries, getAllEntries } from "@/lib/entries";
import { getAllTags } from "@/lib/tags";
import { formatDateTime } from "@/lib/utils";
import { Search, Calendar, Tag, FileText, Filter, X } from "lucide-react";

interface AdvancedSearchProps {
  onEntrySelect: (entryId: string) => void;
  selectedEntryId?: string;
  onViewChange?: (view: string) => void;
}

export function AdvancedSearch({ onEntrySelect, selectedEntryId, onViewChange }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [contentFilter, setContentFilter] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [availableTags, setAvailableTags] = useState<any[]>([]);

  // Load available tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
        setAvailableTags([]);
      }
    };
    loadTags();
  }, []);

  // Perform search when filters change
  useEffect(() => {
    performSearch();
  }, [searchQuery, selectedTags, dateFrom, dateTo, sortBy, sortOrder, contentFilter]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      const filters: SearchFilters = {
        query: searchQuery,
        tags: selectedTags,
        sortBy,
        sortOrder,
      };

      let searchResults = await searchEntries(filters);

      // Apply content filter
      if (contentFilter.trim()) {
        searchResults = searchResults.filter(entry => 
          entry.content.toLowerCase().includes(contentFilter.toLowerCase())
        );
      }

      // Apply date filters
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        searchResults = searchResults.filter(entry => 
          new Date(entry.createdAt) >= fromDate
        );
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        searchResults = searchResults.filter(entry => 
          new Date(entry.createdAt) <= toDate
        );
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Failed to perform search:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setDateFrom("");
    setDateTo("");
    setContentFilter("");
    setSortBy('updatedAt');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || dateFrom || dateTo || contentFilter;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Search size={28} />
          Advanced Search
        </h1>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <Filter size={16} />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Search Filters */}
      <div className="space-y-4 mb-6">
        {/* Basic Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search in titles
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search terms..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {/* Content Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search in content
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={contentFilter}
                  onChange={(e) => setContentFilter(e.target.value)}
                  placeholder="Search within entry content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag.name)
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.name) ? tag.color : undefined
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'title' | 'createdAt' | 'updatedAt')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Created Date</option>
                  <option value="title">Title</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <X size={16} />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Search Results
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {results.length} {results.length === 1 ? 'entry' : 'entries'} found
          </span>
        </div>

        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? 'No entries match your search criteria.' : 'Enter search terms to find entries.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(entry => (
              <div
                key={entry.id}
                onClick={() => {
                  // Switch to dashboard view first
                  if (onViewChange) {
                    onViewChange('dashboard');
                  }
                  // Then select the entry
                  onEntrySelect(entry.id);
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedEntryId === entry.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {entry.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    {formatDateTime(entry.updatedAt)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {entry.content.substring(0, 150)}...
                </p>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tagName, index) => {
                      const tag = availableTags.find(t => t.name === tagName);
                      return (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: tag?.color || '#3B82F6' }}
                        >
                          {tagName}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}