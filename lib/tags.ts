import { Tag } from '@/data/types';
import { mockTags } from '@/data/mockData';
import { generateId } from './utils';

// Check if we should use database or mock data
const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

// Import database operations conditionally
let multiUserDb: any;
if (USE_DATABASE) {
  try {
    multiUserDb = require('./multi-user-db');
    console.log('📊 Tags: Using MULTI-USER DATABASE mode');
  } catch (error) {
    console.error('Failed to load multi-user-db for tags, falling back to mock data:', error);
  }
}

if (!USE_DATABASE || !multiUserDb) {
  console.log('📊 Tags: Using MOCK mode');
}

export async function getAllTags(): Promise<Tag[]> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.getUserTags();
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }
  return mockTags.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.getUserTagById(id);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }
  return mockTags.find(tag => tag.id === id);
}

export async function getTagByName(name: string): Promise<Tag | undefined> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.getUserTagByName(name);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }
  return mockTags.find(tag => tag.name === name);
}

export async function createTag(name: string, color: string): Promise<Tag> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.createUserTag(name, color);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }

  // Mock data fallback
  const newTag: Tag = {
    id: generateId(),
    name,
    color,
    createdAt: new Date()
  };

  mockTags.push(newTag);
  return newTag;
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<Tag | undefined> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.updateUserTag(id, updates);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }

  // Mock data fallback
  const tagIndex = mockTags.findIndex(tag => tag.id === id);
  if (tagIndex === -1) return undefined;

  const updatedTag: Tag = {
    ...mockTags[tagIndex],
    ...updates
  };

  mockTags[tagIndex] = updatedTag;
  return updatedTag;
}

export async function deleteTag(id: string): Promise<boolean> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.deleteUserTag(id);
    } catch (error) {
      console.error('Database operation failed, falling back to mock data:', error);
    }
  }

  // Mock data fallback
  const index = mockTags.findIndex(tag => tag.id === id);
  if (index !== -1) {
    mockTags.splice(index, 1);
    return true;
  }
  return false;
}

// Utility functions
export function getTagColors(): string[] {
  return [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ];
}

export async function getTagUsageCount(tagId: string): Promise<number> {
  if (USE_DATABASE && multiUserDb) {
    try {
      return await multiUserDb.getTagUsageCount(tagId);
    } catch (error) {
      console.error('Database operation failed for tag usage count:', error);
      return 0;
    }
  }

  // Mock data fallback - this would need to be implemented properly
  // For now, return 0 as we don't track usage in mock data
  return 0;
}

// Export direct multi-user functions for advanced usage
export const multiUserTagOperations = multiUserDb || {};
