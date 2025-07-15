import { Tag } from '@/data/types';
import { mockTags } from '@/data/mockData';
import { generateId } from './utils';

export function getAllTags(): Tag[] {
  return mockTags.sort((a, b) => a.name.localeCompare(b.name));
}

export function getTagById(id: string): Tag | undefined {
  return mockTags.find(tag => tag.id === id);
}

export function getTagByName(name: string): Tag | undefined {
  return mockTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
}

export function createTag(name: string, color?: string): Tag {
  const existingTag = getTagByName(name);
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

export function updateTag(id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>): Tag | null {
  const tagIndex = mockTags.findIndex(tag => tag.id === id);
  if (tagIndex === -1) return null;

  const updatedTag: Tag = {
    ...mockTags[tagIndex],
    ...updates,
  };

  mockTags[tagIndex] = updatedTag;
  return updatedTag;
}

export function deleteTag(id: string): boolean {
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