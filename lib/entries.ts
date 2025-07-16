import { Entry, EntryHistory, SearchFilters } from '@/data/types';
import { extractTextFromMarkdown } from './utils';

// Database operations
const multiUserDb = require('./multi-user-db');

console.log('📊 Using MULTI-USER DATABASE mode');

// Recently accessed entries storage
let recentlyAccessedEntries: string[] = [];

// =============================================
// DATABASE OPERATIONS (Production Mode)
// =============================================

export async function getAllEntries(): Promise<Entry[]> {
  try {
    return await multiUserDb.getUserEntries();
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    throw new Error('Failed to fetch entries from database');
  }
}

export async function getEntryById(id: string): Promise<Entry | undefined> {
  try {
    return await multiUserDb.getUserEntryById(id);
  } catch (error) {
    console.error('Failed to fetch entry:', error);
    return undefined;
  }
}

export async function createEntry(title: string, content: string, tags: string[] = [], images: string[] = []): Promise<Entry> {
  try {
    return await multiUserDb.createUserEntry(title, content, tags, images);
  } catch (error) {
    console.error('Failed to create entry:', error);
    throw new Error('Failed to create entry in database');
  }
}

export async function updateEntry(id: string, updates: Partial<Pick<Entry, 'title' | 'content' | 'tags' | 'images'>>): Promise<Entry | null> {
  try {
    return await multiUserDb.updateUserEntry(id, updates);
  } catch (error) {
    console.error('Failed to update entry:', error);
    throw new Error('Failed to update entry in database');
  }
}

export async function deleteEntry(id: string): Promise<boolean> {
  try {
    const success = await multiUserDb.deleteUserEntry(id);
    if (success) {
      // Remove from recently accessed if it exists
      recentlyAccessedEntries = recentlyAccessedEntries.filter(entryId => entryId !== id);
    }
    return success;
  } catch (error) {
    console.error('Failed to delete entry:', error);
    throw new Error('Failed to delete entry from database');
  }
}

export async function searchEntries(filters: SearchFilters): Promise<Entry[]> {
  try {
    return await multiUserDb.searchUserEntries(filters);
  } catch (error) {
    console.error('Failed to search entries:', error);
    throw new Error('Failed to search entries in database');
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

export function addToRecentlyAccessed(entryId: string): void {
  const index = recentlyAccessedEntries.indexOf(entryId);
  if (index > -1) {
    recentlyAccessedEntries.splice(index, 1);
  }
  recentlyAccessedEntries.unshift(entryId);
  
  // Keep only the last 10 entries
  if (recentlyAccessedEntries.length > 10) {
    recentlyAccessedEntries = recentlyAccessedEntries.slice(0, 10);
  }
}

export function getRecentlyAccessedEntries(): string[] {
  return [...recentlyAccessedEntries];
}

export async function getRecentlyAccessedEntriesDetails(): Promise<Entry[]> {
  try {
    const recentIds = getRecentlyAccessedEntries();
    const entries: Entry[] = [];
    
    for (const id of recentIds) {
      const entry = await getEntryById(id);
      if (entry) {
        entries.push(entry);
      }
    }
    
    return entries;
  } catch (error) {
    console.error('Failed to get recently accessed entries details:', error);
    return [];
  }
}

export async function getEntriesByTag(tagName: string): Promise<Entry[]> {
  try {
    const allEntries = await getAllEntries();
    return allEntries.filter(entry => entry.tags.includes(tagName));
  } catch (error) {
    console.error('Failed to get entries by tag:', error);
    return [];
  }
}

export async function getEntriesCreatedInPeriod(days: number): Promise<Entry[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const allEntries = await getAllEntries();
    return allEntries.filter(entry => entry.createdAt >= cutoffDate);
  } catch (error) {
    console.error('Failed to get entries by period:', error);
    return [];
  }
}

export async function getDuplicateEntries(): Promise<Entry[]> {
  try {
    const allEntries = await getAllEntries();
    const duplicates: Entry[] = [];
    const titleMap = new Map<string, Entry[]>();
    
    // Group entries by title
    allEntries.forEach(entry => {
      const title = entry.title.toLowerCase().trim();
      if (!titleMap.has(title)) {
        titleMap.set(title, []);
      }
      titleMap.get(title)!.push(entry);
    });
    
    // Find duplicates
    titleMap.forEach(entries => {
      if (entries.length > 1) {
        duplicates.push(...entries);
      }
    });
    
    return duplicates;
  } catch (error) {
    console.error('Failed to find duplicate entries:', error);
    return [];
  }
}

export async function getEntryStats() {
  try {
    const allEntries = await getAllEntries();
    
    const stats = {
      totalEntries: allEntries.length,
      totalWords: allEntries.reduce((sum, entry) => {
        const words = extractTextFromMarkdown(entry.content).split(/\s+/).filter(word => word.length > 0);
        return sum + words.length;
      }, 0),
      averageWordsPerEntry: 0,
      entriesThisWeek: 0,
      entriesThisMonth: 0,
      totalImages: allEntries.reduce((sum, entry) => sum + (entry.images?.length || 0), 0),
    };
    
    stats.averageWordsPerEntry = stats.totalEntries > 0 ? Math.round(stats.totalWords / stats.totalEntries) : 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    stats.entriesThisWeek = allEntries.filter(entry => entry.createdAt >= weekAgo).length;
    stats.entriesThisMonth = allEntries.filter(entry => entry.createdAt >= monthAgo).length;
    
    return stats;
  } catch (error) {
    console.error('Failed to get entry stats:', error);
    return {
      totalEntries: 0,
      totalWords: 0,
      averageWordsPerEntry: 0,
      entriesThisWeek: 0,
      entriesThisMonth: 0,
      totalImages: 0,
    };
  }
}