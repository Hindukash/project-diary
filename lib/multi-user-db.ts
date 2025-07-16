import { Entry, EntryHistory, SearchFilters, Tag } from '@/data/types';
import { supabase } from './supabase';
import { extractTextFromMarkdown } from './utils';
import { requireAuth, getCurrentUser } from './auth-db';

// Tag colors utility function
function getTagColors(): string[] {
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

// Helper function to retry operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Helper function to convert database entry to app entry format
function dbEntryToAppEntry(dbEntry: any, tags: string[] = []): Entry {
  return {
    id: dbEntry.id,
    title: dbEntry.title,
    content: dbEntry.content,
    summary: dbEntry.summary || '',
    tags: tags,
    createdAt: new Date(dbEntry.created_at),
    updatedAt: new Date(dbEntry.updated_at),
    images: Array.isArray(dbEntry.images) ? dbEntry.images : [],
    version: dbEntry.version,
    history: [] // Will be loaded separately if needed
  };
}

// Helper function to convert database tag to app tag format
function dbTagToAppTag(dbTag: any): Tag {
  return {
    id: dbTag.id,
    name: dbTag.name,
    color: dbTag.color,
    createdAt: new Date(dbTag.created_at)
  };
}

// =============================================
// ENTRY OPERATIONS
// =============================================

export async function getUserEntries(): Promise<Entry[]> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // RLS policies will automatically filter by user_id
    const { data: entries, error } = await supabase
      .from('entries')
      .select(`
        *,
        entry_tags (
          tags (
            name
          )
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user entries:', error);
      throw new Error(`Failed to fetch entries: ${error.message}`);
    }

    return entries.map(entry => {
      const tags = entry.entry_tags?.map((et: any) => et.tags.name) || [];
      return dbEntryToAppEntry(entry, tags);
    });
  });
}

export async function getUserEntryById(id: string): Promise<Entry | undefined> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    const { data: entry, error } = await supabase
      .from('entries')
      .select(`
        *,
        entry_tags (
          tags (
            name
          )
        ),
        entry_history (
          id,
          title,
          content,
          version,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error fetching entry:', error);
      throw new Error(`Failed to fetch entry: ${error.message}`);
    }

    const tags = entry.entry_tags?.map((et: any) => et.tags.name) || [];
    const history: EntryHistory[] = entry.entry_history?.map((h: any) => ({
      id: h.id,
      entryId: id,
      title: h.title,
      content: h.content,
      version: h.version,
      updatedAt: new Date(h.created_at)
    })) || [];

    const appEntry = dbEntryToAppEntry(entry, tags);
    appEntry.history = history;
    return appEntry;
  });
}

export async function createUserEntry(
  title: string,
  content: string,
  tags: string[] = [],
  images: string[] = []
): Promise<Entry> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    const now = new Date();
    const plainText = extractTextFromMarkdown(content);
    const summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    // Create any new tags that don't exist yet
    const tagObjects = await Promise.all(
      tags.map(async (tagName) => {
        let tag = await getUserTagByName(tagName);
        if (!tag) {
          tag = await createUserTag(tagName);
        }
        return tag;
      })
    );

    // Create the entry with user_id
    const { data: newEntry, error: entryError } = await supabase
      .from('entries')
      .insert([
        {
          title,
          content,
          summary,
          images: images,
          version: 1,
          user_id: user.id,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }
      ])
      .select()
      .single();

    if (entryError) {
      console.error('Error creating entry:', entryError);
      throw new Error(`Failed to create entry: ${entryError.message}`);
    }

    // Create entry-tag relationships
    if (tagObjects.length > 0) {
      const entryTags = tagObjects.map(tag => ({
        entry_id: newEntry.id,
        tag_id: tag.id
      }));

      const { error: tagError } = await supabase
        .from('entry_tags')
        .insert(entryTags);

      if (tagError) {
        console.error('Error creating entry-tag relationships:', tagError);
        // Don't throw here, entry was created successfully
      }
    }

    return dbEntryToAppEntry(newEntry, tags);
  });
}

export async function updateUserEntry(
  id: string,
  updates: Partial<Pick<Entry, 'title' | 'content' | 'tags' | 'images'>>
): Promise<Entry | null> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // Get current entry (RLS will ensure user ownership)
    const currentEntry = await getUserEntryById(id);
    if (!currentEntry) {
      return null;
    }

    const now = new Date();
    
    // Create any new tags that don't exist yet
    let tagObjects: any[] = [];
    if (updates.tags) {
      tagObjects = await Promise.all(
        updates.tags.map(async (tagName) => {
          let tag = await getUserTagByName(tagName);
          if (!tag) {
            tag = await createUserTag(tagName);
          }
          return tag;
        })
      );
    }

    // Save current version to history
    const { error: historyError } = await supabase
      .from('entry_history')
      .insert([
        {
          entry_id: id,
          title: currentEntry.title,
          content: currentEntry.content,
          version: currentEntry.version,
          created_at: currentEntry.updatedAt.toISOString()
        }
      ]);

    if (historyError) {
      console.error('Error saving entry history:', historyError);
      // Continue anyway, don't block the update
    }

    // Prepare update object
    const updateData: any = {
      updated_at: now.toISOString(),
      version: currentEntry.version + 1
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) {
      updateData.content = updates.content;
      const plainText = extractTextFromMarkdown(updates.content);
      updateData.summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }
    if (updates.images !== undefined) updateData.images = updates.images;

    // Update the entry (RLS will ensure user ownership)
    const { data: updatedEntry, error: updateError } = await supabase
      .from('entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating entry:', updateError);
      throw new Error(`Failed to update entry: ${updateError.message}`);
    }

    // Update entry-tag relationships if tags were provided
    if (updates.tags) {
      // Delete existing relationships
      const { error: deleteError } = await supabase
        .from('entry_tags')
        .delete()
        .eq('entry_id', id);

      if (deleteError) {
        console.error('Error deleting entry-tag relationships:', deleteError);
      }

      // Create new relationships
      if (tagObjects.length > 0) {
        const entryTags = tagObjects.map(tag => ({
          entry_id: id,
          tag_id: tag.id
        }));

        const { error: tagError } = await supabase
          .from('entry_tags')
          .insert(entryTags);

        if (tagError) {
          console.error('Error creating entry-tag relationships:', tagError);
        }
      }
    }

    return dbEntryToAppEntry(updatedEntry, updates.tags || currentEntry.tags);
  });
}

export async function deleteUserEntry(id: string): Promise<boolean> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // RLS will ensure user ownership
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      throw new Error(`Failed to delete entry: ${error.message}`);
    }

    return true;
  });
}

export async function searchUserEntries(filters: SearchFilters): Promise<Entry[]> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // RLS will automatically filter by user_id
    let query = supabase
      .from('entries')
      .select(`
        *,
        entry_tags (
          tags (
            name
          )
        )
      `);

    // Apply text search only if query is not empty
    if (filters.query && filters.query.trim() !== '') {
      const searchQuery = `%${filters.query}%`;
      query = query.or(`title.ilike.${searchQuery},content.ilike.${searchQuery},summary.ilike.${searchQuery}`);
    }

    // Apply date filters
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    // Apply sorting
    const sortByMap: { [key: string]: string } = {
      'updatedAt': 'updated_at',
      'createdAt': 'created_at',
      'title': 'title'
    };
    
    const sortBy = filters.sortBy || 'updatedAt';
    const dbSortBy = sortByMap[sortBy] || 'updated_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

    const { data: entries, error } = await query;

    if (error) {
      console.error('Error searching entries:', error);
      throw new Error(`Failed to search entries: ${error.message}`);
    }

    let results = entries.map(entry => {
      const tags = entry.entry_tags?.map((et: any) => et.tags.name) || [];
      return dbEntryToAppEntry(entry, tags);
    });

    // Apply tag filtering (client-side for now)
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(entry =>
        filters.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    return results;
  });
}

// =============================================
// TAG OPERATIONS
// =============================================

export async function getUserTags(): Promise<Tag[]> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // RLS will automatically filter by user_id
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching user tags:', error);
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    return tags.map(dbTagToAppTag);
  });
}

export async function getUserTagById(id: string): Promise<Tag | undefined> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    const { data: tag, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error fetching tag:', error);
      throw new Error(`Failed to fetch tag: ${error.message}`);
    }

    return dbTagToAppTag(tag);
  });
}

export async function getUserTagByName(name: string): Promise<Tag | undefined> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    const { data: tag, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error fetching tag by name:', error);
      throw new Error(`Failed to fetch tag by name: ${error.message}`);
    }

    return dbTagToAppTag(tag);
  });
}

export async function createUserTag(name: string, color?: string): Promise<Tag> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // Check if tag already exists for this user
    const existingTag = await getUserTagByName(name);
    if (existingTag) {
      return existingTag;
    }

    // Use random color if not specified
    const colors = getTagColors();
    const randomColor = color || colors[Math.floor(Math.random() * colors.length)];

    const { data: newTag, error } = await supabase
      .from('tags')
      .insert([
        {
          name,
          color: randomColor,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      throw new Error(`Failed to create tag: ${error.message}`);
    }

    return dbTagToAppTag(newTag);
  });
}

export async function updateUserTag(
  id: string,
  updates: Partial<Pick<Tag, 'name' | 'color'>>
): Promise<Tag | null> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // RLS will ensure user ownership
    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error updating tag:', error);
      throw new Error(`Failed to update tag: ${error.message}`);
    }

    return dbTagToAppTag(updatedTag);
  });
}

export async function deleteUserTag(id: string): Promise<boolean> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    // RLS will ensure user ownership
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tag:', error);
      throw new Error(`Failed to delete tag: ${error.message}`);
    }

    return true;
  });
}

export async function getTagUsageCount(tagId: string): Promise<number> {
  const user = await requireAuth();
  
  return retryOperation(async () => {
    const { count, error } = await supabase
      .from('entry_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', tagId);

    if (error) {
      console.error('Error getting tag usage count:', error);
      return 0;
    }

    return count || 0;
  });
}
