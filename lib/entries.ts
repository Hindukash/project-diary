import { Entry, EntryHistory, SearchFilters } from '@/data/types';
import { mockEntries } from '@/data/mockData';
import { generateId, extractTextFromMarkdown } from './utils';
import { createTag, getTagByName } from './tags';

// Check if we should use database or mock data
const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

console.log('🔧 USE_DATABASE:', USE_DATABASE);
console.log('🔧 Environment variable NEXT_PUBLIC_USE_DATABASE:', process.env.NEXT_PUBLIC_USE_DATABASE);

// Import database operations conditionally
let dbEntries: any;
if (USE_DATABASE) {
  dbEntries = require('./entries-db');
  console.log('📊 Using DATABASE mode');
} else {
  console.log('📊 Using MOCK mode');
}

// Recently accessed entries storage
let recentlyAccessedEntries: string[] = [];

export async function getAllEntries(): Promise<Entry[]> {
  if (USE_DATABASE && dbEntries) {
    return await dbEntries.getAllEntries();
  }
  return mockEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getEntryById(id: string): Promise<Entry | undefined> {
  if (USE_DATABASE && dbEntries) {
    return await dbEntries.getEntryById(id);
  }
  return mockEntries.find(entry => entry.id === id);
}

export async function searchEntries(filters: SearchFilters): Promise<Entry[]> {
  if (USE_DATABASE && dbEntries) {
    return await dbEntries.searchEntries(filters);
  }
  
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

  if (filters.dateFrom) {
    filteredEntries = filteredEntries.filter(entry =>
      new Date(entry.createdAt) >= filters.dateFrom!
    );
  }

  if (filters.dateTo) {
    filteredEntries = filteredEntries.filter(entry =>
      new Date(entry.createdAt) <= filters.dateTo!
    );
  }

  const sortBy = filters.sortBy || 'updatedAt';
  const sortOrder = filters.sortOrder || 'desc';

  filteredEntries.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
      default:
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filteredEntries;
}

export async function createEntry(title: string, content: string, tags: string[] = [], images: string[] = []): Promise<Entry> {
  if (USE_DATABASE && dbEntries) {
    return await dbEntries.createEntry(title, content, tags, images);
  }
  
  const now = new Date();
  const plainText = extractTextFromMarkdown(content);
  const summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

  // Create any new tags that don't exist yet
  tags.forEach(tagName => {
    if (!getTagByName(tagName)) {
      createTag(tagName);
    }
  });

  const newEntry: Entry = {
    id: generateId(),
    title,
    content,
    summary,
    tags,
    createdAt: now,
    updatedAt: now,
    images,
    version: 1,
    history: [],
  };

  mockEntries.push(newEntry);
  return newEntry;
}

export async function updateEntry(id: string, updates: Partial<Pick<Entry, 'title' | 'content' | 'tags' | 'images'>>): Promise<Entry | null> {
  if (USE_DATABASE && dbEntries) {
    return await dbEntries.updateEntry(id, updates);
  }
  
  const entryIndex = mockEntries.findIndex(entry => entry.id === id);
  if (entryIndex === -1) return null;

  const entry = mockEntries[entryIndex];
  const now = new Date();

  // Create any new tags that don't exist yet
  if (updates.tags) {
    updates.tags.forEach(tagName => {
      if (!getTagByName(tagName)) {
        createTag(tagName);
      }
    });
  }

  // Save current version to history
  const historyEntry: EntryHistory = {
    id: generateId(),
    entryId: id,
    title: entry.title,
    content: entry.content,
    updatedAt: entry.updatedAt,
    version: entry.version,
  };

  // Update entry
  const updatedEntry: Entry = {
    ...entry,
    ...updates,
    updatedAt: now,
    version: entry.version + 1,
    history: [...entry.history, historyEntry],
  };

  // Update summary if content changed
  if (updates.content) {
    const plainText = extractTextFromMarkdown(updates.content);
    updatedEntry.summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }

  mockEntries[entryIndex] = updatedEntry;
  return updatedEntry;
}

export async function deleteEntry(id: string): Promise<boolean> {
  if (USE_DATABASE && dbEntries) {
    return await dbEntries.deleteEntry(id);
  }
  
  const entryIndex = mockEntries.findIndex(entry => entry.id === id);
  
  if (entryIndex === -1) {
    return false;
  }

  mockEntries.splice(entryIndex, 1);
  
  // Remove from recently accessed entries
  recentlyAccessedEntries = recentlyAccessedEntries.filter(entryId => entryId !== id);
  
  return true;
}

// Recently accessed entries functions
export function addToRecentlyAccessed(entryId: string): void {
  if (USE_DATABASE && dbEntries) {
    dbEntries.addToRecentlyAccessed(entryId);
    return;
  }
  
  // Remove if already exists
  recentlyAccessedEntries = recentlyAccessedEntries.filter(id => id !== entryId);
  
  // Add to beginning
  recentlyAccessedEntries.unshift(entryId);
  
  // Keep only last 5
  if (recentlyAccessedEntries.length > 5) {
    recentlyAccessedEntries = recentlyAccessedEntries.slice(0, 5);
  }
}

export async function getRecentlyAccessedEntries(): Promise<Entry[]> {
  if (USE_DATABASE && dbEntries) {
    return await dbEntries.getRecentlyAccessedEntries();
  }
  
  const entries = await Promise.all(
    recentlyAccessedEntries.map(async id => await getEntryById(id))
  );
  return entries.filter(entry => entry !== undefined) as Entry[];
}