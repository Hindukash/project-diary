import { Entry, EntryHistory, SearchFilters } from '@/data/types';
import { mockEntries } from '@/data/mockData';
import { generateId, extractTextFromMarkdown } from './utils';
import { createTag, getTagByName } from './tags';

// Check if we should use database or mock data
const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

console.log('🔧 USE_DATABASE:', USE_DATABASE);
console.log('🔧 Environment variable NEXT_PUBLIC_USE_DATABASE:', process.env.NEXT_PUBLIC_USE_DATABASE);

// Import database operations conditionally
let multiUserDb: any;
if (USE_DATABASE) {
  try {
    multiUserDb = require('./multi-user-db');
    console.log('📊 Using MULTI-USER DATABASE mode');
  } catch (error) {
    console.error('Failed to load multi-user-db, falling back to mock data:', error);
  }
}

if (!USE_DATABASE || !multiUserDb) {
  console.log('📊 Using MOCK mode');
}

// Recently accessed entries storage
let recentlyAccessedEntries: string[] = [];

// =============================================
// MAIN ENTRY FUNCTIONS (Auto-switch between multi-user DB and mock)
// =============================================

export async function getAllEntries(): Promise<Entry[]> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.getUserEntries();
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }
  return mockEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getEntryById(id: string): Promise<Entry | undefined> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.getUserEntryById(id);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }
  return mockEntries.find(entry => entry.id === id);
}

export async function createEntry(
  title: string,
  content: string,
  tags: string[] = [],
  images: string[] = []
): Promise<Entry> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.createUserEntry(title, content, tags, images);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }

  // Mock data fallback
  const now = new Date();
  const plainText = extractTextFromMarkdown(content);
  const summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

  const newEntry: Entry = {
    id: generateId(),
    title,
    content,
    summary,
    tags,
    images,
    createdAt: now,
    updatedAt: now,
    version: 1,
    history: []
  };

  mockEntries.unshift(newEntry);
  return newEntry;
}

export async function updateEntry(id: string, updates: Partial<Entry>): Promise<Entry | undefined> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.updateUserEntry(id, updates);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }

  // Mock data fallback
  const entryIndex = mockEntries.findIndex(entry => entry.id === id);
  if (entryIndex === -1) return undefined;

  const currentEntry = mockEntries[entryIndex];
  const updatedEntry: Entry = {
    ...currentEntry,
    ...updates,
    updatedAt: new Date(),
    version: (currentEntry.version || 1) + 1
  };

  mockEntries[entryIndex] = updatedEntry;
  return updatedEntry;
}

export async function deleteEntry(id: string): Promise<boolean> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.deleteUserEntry(id);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }

  // Mock data fallback
  const initialLength = mockEntries.length;
  const index = mockEntries.findIndex(entry => entry.id === id);
  if (index !== -1) {
    mockEntries.splice(index, 1);
    recentlyAccessedEntries = recentlyAccessedEntries.filter(entryId => entryId !== id);
    return true;
  }
  return false;
}

export async function searchEntries(filters: SearchFilters): Promise<Entry[]> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.searchUserEntries(filters);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }

  // Mock data fallback
  let filteredEntries = [...mockEntries];

  if (filters.query) {
    const query = filters.query.toLowerCase();
    filteredEntries = filteredEntries.filter(entry =>
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.summary.toLowerCase().includes(query)
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    filteredEntries = filteredEntries.filter(entry =>
      filters.tags!.some(tag => entry.tags.includes(tag))
    );
  }

  if (filters.period) {
    const now = new Date();
    let cutoffDate: Date;

    switch (filters.period) {
      case 'today':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        cutoffDate = new Date(0);
    }

    filteredEntries = filteredEntries.filter(entry =>
      new Date(entry.updatedAt) >= cutoffDate
    );
  }

  return filteredEntries.sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
}

// =============================================
// RECENTLY ACCESSED ENTRIES
// =============================================

export function addToRecentlyAccessed(entryId: string): void {
  recentlyAccessedEntries = recentlyAccessedEntries.filter(id => id !== entryId);
  recentlyAccessedEntries.unshift(entryId);
  recentlyAccessedEntries = recentlyAccessedEntries.slice(0, 10);
}

export function getRecentlyAccessedEntries(): string[] {
  return [...recentlyAccessedEntries];
}

export async function getRecentlyAccessedEntriesDetails(): Promise<Entry[]> {
  const recentIds = getRecentlyAccessedEntries();
  const entries: Entry[] = [];
  
  for (const id of recentIds) {
    const entry = await getEntryById(id);
    if (entry) {
      entries.push(entry);
    }
  }
  
  return entries;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

export function getEntryWordCount(entry: Entry): number {
  const plainText = extractTextFromMarkdown(entry.content);
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

export function getEntryReadTime(entry: Entry): number {
  const wordCount = getEntryWordCount(entry);
  return Math.ceil(wordCount / 200); // Assuming 200 words per minute reading speed
}

export async function duplicateEntry(id: string): Promise<Entry | undefined> {
  const originalEntry = await getEntryById(id);
  if (!originalEntry) return undefined;

  return createEntry(
    `${originalEntry.title} (Copy)`,
    originalEntry.content,
    originalEntry.tags,
    originalEntry.images
  );
}

// Export direct multi-user functions for advanced usage
export const multiUserOperations = multiUserDb || {};
