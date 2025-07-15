export interface Entry {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  version: number;
  history: EntryHistory[];
}

export interface EntryHistory {
  id: string;
  entryId: string;
  title: string;
  content: string;
  updatedAt: Date;
  version: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}