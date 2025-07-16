import { Tag } from '@/data/types';
import { mockTags } from '@/data/mockData';
import { generateId } from './utils';

// Check if we should use database or mock data
const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

// Import database operations conditionally
let dbTags: any;
if (USE_DATABASE) {
  dbTags = require('./tags-db');
}

export async function getAllTags(): Promise<Tag[]> {
  if (USE_DATABASE && dbTags) {
    return await dbTags.getAllTags();
  }
  return mockTags.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  if (USE_DATABASE && dbTags) {
    return await dbTags.getTagById(id);
  }
  return mockTags.find(tag => tag.id === id);
}

export async function getTagByName(name: string): Promise<Tag | undefined> {
  if (USE_DATABASE && dbTags) {
    return await dbTags.getTagByName(name);
  }
  return mockTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  if (USE_DATABASE && dbTags) {
    return await dbTags.createTag(name, color);
  }
  
  const existingTag = await getTagByName(name);
  if (existingTag) return existingTag;

  // Use random color if not specified
  const colors = getTagColors();
  const randomColor = color || colors[Math.floor(Math.random() * colors.length)];

  const newTag: Tag = {
    id: generateId(),
    name,
    color: randomColor,
    createdAt: new Date(),
  };

  mockTags.push(newTag);
  return newTag;
}

export async function updateTag(id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>): Promise<Tag | null> {
  if (USE_DATABASE && dbTags) {
    return await dbTags.updateTag(id, updates);
  }
  
  const tagIndex = mockTags.findIndex(tag => tag.id === id);
  if (tagIndex === -1) return null;

  const updatedTag: Tag = {
    ...mockTags[tagIndex],
    ...updates,
  };

  mockTags[tagIndex] = updatedTag;
  return updatedTag;
}

export async function deleteTag(id: string): Promise<boolean> {
  if (USE_DATABASE && dbTags) {
    return await dbTags.deleteTag(id);
  }
  
  const tagIndex = mockTags.findIndex(tag => tag.id === id);
  if (tagIndex === -1) return false;

  mockTags.splice(tagIndex, 1);
  return true;
}

export function getTagColors(): string[] {
  return [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];
}