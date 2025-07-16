import { Entry, EntryHistory, SearchFilters } from '@/data/types';
import { supabase } from './supabase';
import { generateId, extractTextFromMarkdown } from './utils';
import { createTag, getTagByName, getAllTags } from './tags-db';

// Recently accessed entries - keep in localStorage for now
const RECENT_ENTRIES_KEY = 'project-diary-recent-entries';

// Helper function to get recently accessed from localStorage
function getRecentFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(RECENT_ENTRIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Helper function to save recently accessed to localStorage
function saveRecentToStorage(entries: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECENT_ENTRIES_KEY, JSON.stringify(entries));
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

export async function getAllEntries(): Promise<Entry[]> {
  return retryOperation(async () => {
    // Get all entries with their tags
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
      console.error('Error fetching entries:', error);
      throw new Error(`Failed to fetch entries: ${error.message}`);
    }

    return entries.map(entry => {
      const tags = entry.entry_tags?.map((et: any) => et.tags.name) || [];
      return dbEntryToAppEntry(entry, tags);
    });
  });
}

export async function getEntryById(id: string): Promise<Entry | undefined> {
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
        // No rows returned
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

export async function createEntry(
  title: string,
  content: string,
  tags: string[] = [],
  images: string[] = []
): Promise<Entry> {
  return retryOperation(async () => {
    const now = new Date();
    const plainText = extractTextFromMarkdown(content);
    const summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    // Create any new tags that don't exist yet
    const tagObjects = await Promise.all(
      tags.map(async (tagName) => {
        let tag = await getTagByName(tagName);
        if (!tag) {
          tag = await createTag(tagName);
        }
        return tag;
      })
    );

    // Create the entry
    const { data: newEntry, error: entryError } = await supabase
      .from('entries')
      .insert([
        {
          title,
          content,
          summary,
          images: images,
          version: 1,
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

export async function updateEntry(
  id: string,
  updates: Partial<Pick<Entry, 'title' | 'content' | 'tags' | 'images'>>
): Promise<Entry | null> {
  return retryOperation(async () => {
    // Get current entry
    const currentEntry = await getEntryById(id);
    if (!currentEntry) {
      return null;
    }

    const now = new Date();
    
    // Create any new tags that don't exist yet
    let tagObjects: any[] = [];
    if (updates.tags) {
      tagObjects = await Promise.all(
        updates.tags.map(async (tagName) => {
          let tag = await getTagByName(tagName);
          if (!tag) {
            tag = await createTag(tagName);
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

    // Update the entry
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

export async function deleteEntry(id: string): Promise<boolean> {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      throw new Error(`Failed to delete entry: ${error.message}`);
    }

    // Remove from recently accessed entries
    const recent = getRecentFromStorage();
    const filtered = recent.filter(entryId => entryId !== id);
    saveRecentToStorage(filtered);

    return true;
  });
}

export async function searchEntries(filters: SearchFilters): Promise<Entry[]> {
  return retryOperation(async () => {
    console.log('🔍 searchEntries called with filters:', filters);
    
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
      console.log('📝 Applying text search for query:', filters.query);
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

    // Apply sorting - map camelCase to snake_case
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

    console.log('📊 Raw database entries:', entries);

    let results = entries.map(entry => {
      const tags = entry.entry_tags?.map((et: any) => et.tags.name) || [];
      return dbEntryToAppEntry(entry, tags);
    });

    console.log('📋 Processed entries:', results);

    // Apply tag filtering (client-side for now)
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(entry =>
        filters.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    return results;
  });
}

// Recently accessed entries functions
export function addToRecentlyAccessed(entryId: string): void {
  const recent = getRecentFromStorage();
  const filtered = recent.filter(id => id !== entryId);
  filtered.unshift(entryId);
  
  const limited = filtered.slice(0, 5);
  saveRecentToStorage(limited);
}

export async function getRecentlyAccessedEntries(): Promise<Entry[]> {
  const recent = getRecentFromStorage();
  if (recent.length === 0) return [];

  const entries = await Promise.all(
    recent.map(async id => {
      try {
        return await getEntryById(id);
      } catch (error) {
        console.error(`Error fetching recent entry ${id}:`, error);
        return undefined;
      }
    })
  );

  return entries.filter(entry => entry !== undefined) as Entry[];
}