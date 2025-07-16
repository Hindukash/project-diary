import { Tag } from '@/data/types';

// Database operations
const multiUserDb = require('./multi-user-db');

console.log('📊 Tags: Using MULTI-USER DATABASE mode');

// Tag colors for the application
const TAG_COLORS = [
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

// =============================================
// DATABASE OPERATIONS (Production Mode)
// =============================================

export async function getAllTags(): Promise<Tag[]> {
  try {
    return await multiUserDb.getUserTags();
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    throw new Error('Failed to fetch tags from database');
  }
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  try {
    return await multiUserDb.getUserTagById(id);
  } catch (error) {
    console.error('Failed to fetch tag:', error);
    return undefined;
  }
}

export async function getTagByName(name: string): Promise<Tag | undefined> {
  try {
    return await multiUserDb.getUserTagByName(name);
  } catch (error) {
    console.error('Failed to fetch tag by name:', error);
    return undefined;
  }
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  try {
    return await multiUserDb.createUserTag(name, color);
  } catch (error) {
    console.error('Failed to create tag:', error);
    throw new Error('Failed to create tag in database');
  }
}

export async function updateTag(id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>): Promise<Tag | null> {
  try {
    return await multiUserDb.updateUserTag(id, updates);
  } catch (error) {
    console.error('Failed to update tag:', error);
    throw new Error('Failed to update tag in database');
  }
}

export async function deleteTag(id: string): Promise<boolean> {
  try {
    return await multiUserDb.deleteUserTag(id);
  } catch (error) {
    console.error('Failed to delete tag:', error);
    throw new Error('Failed to delete tag from database');
  }
}

export async function getTagUsageCount(tagId: string): Promise<number> {
  try {
    return await multiUserDb.getTagUsageCount(tagId);
  } catch (error) {
    console.error('Failed to get tag usage count:', error);
    return 0;
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

export function getTagColors(): string[] {
  return [...TAG_COLORS];
}

export function getRandomTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

export async function getUnusedTags(): Promise<Tag[]> {
  try {
    const allTags = await getAllTags();
    const unusedTags: Tag[] = [];
    
    for (const tag of allTags) {
      const usageCount = await getTagUsageCount(tag.id);
      if (usageCount === 0) {
        unusedTags.push(tag);
      }
    }
    
    return unusedTags;
  } catch (error) {
    console.error('Failed to get unused tags:', error);
    return [];
  }
}

export async function getMostUsedTags(limit: number = 10): Promise<Array<Tag & { usageCount: number }>> {
  try {
    const allTags = await getAllTags();
    const tagsWithUsage = await Promise.all(
      allTags.map(async (tag) => ({
        ...tag,
        usageCount: await getTagUsageCount(tag.id)
      }))
    );
    
    return tagsWithUsage
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get most used tags:', error);
    return [];
  }
}

export async function getTagStats() {
  try {
    const allTags = await getAllTags();
    const tagUsages = await Promise.all(
      allTags.map(tag => getTagUsageCount(tag.id))
    );
    
    const totalUsage = tagUsages.reduce((sum, usage) => sum + usage, 0);
    const usedTags = tagUsages.filter(usage => usage > 0).length;
    
    return {
      totalTags: allTags.length,
      usedTags,
      unusedTags: allTags.length - usedTags,
      totalUsage,
      averageUsagePerTag: allTags.length > 0 ? Math.round(totalUsage / allTags.length * 100) / 100 : 0,
    };
  } catch (error) {
    console.error('Failed to get tag stats:', error);
    return {
      totalTags: 0,
      usedTags: 0,
      unusedTags: 0,
      totalUsage: 0,
      averageUsagePerTag: 0,
    };
  }
}