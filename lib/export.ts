import { Entry } from '@/data/types';
import { formatDateTime } from './utils';

export interface ExportOptions {
  format: 'markdown' | 'json' | 'txt';
  includeImages: boolean;
  includeTags: boolean;
  includeMetadata: boolean;
}

export function exportEntry(entry: Entry, options: ExportOptions): string {
  switch (options.format) {
    case 'markdown':
      return exportToMarkdown(entry, options);
    case 'json':
      return exportToJSON(entry, options);
    case 'txt':
      return exportToText(entry, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

export function exportMultipleEntries(entries: Entry[], options: ExportOptions): string {
  switch (options.format) {
    case 'markdown':
      return entries.map(entry => exportToMarkdown(entry, options)).join('\n\n---\n\n');
    case 'json':
      return JSON.stringify(entries.map(entry => formatEntryForExport(entry, options)), null, 2);
    case 'txt':
      return entries.map(entry => exportToText(entry, options)).join('\n\n' + '='.repeat(50) + '\n\n');
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

function exportToMarkdown(entry: Entry, options: ExportOptions): string {
  let content = `# ${entry.title}\n\n`;
  
  if (options.includeMetadata) {
    content += `**Created:** ${formatDateTime(entry.createdAt)}\n`;
    content += `**Last Updated:** ${formatDateTime(entry.updatedAt)}\n`;
    content += `**Version:** ${entry.version}\n\n`;
  }
  
  if (options.includeTags && entry.tags.length > 0) {
    content += `**Tags:** ${entry.tags.map(tag => `#${tag}`).join(', ')}\n\n`;
  }
  
  content += `${entry.content}\n`;
  
  if (options.includeImages && entry.images.length > 0) {
    content += `\n## Images\n\n`;
    entry.images.forEach((image, index) => {
      content += `![Image ${index + 1}](${image})\n`;
    });
  }
  
  return content;
}

function exportToJSON(entry: Entry, options: ExportOptions): string {
  const exportData = formatEntryForExport(entry, options);
  return JSON.stringify(exportData, null, 2);
}

function exportToText(entry: Entry, options: ExportOptions): string {
  let content = `${entry.title}\n${'='.repeat(entry.title.length)}\n\n`;
  
  if (options.includeMetadata) {
    content += `Created: ${formatDateTime(entry.createdAt)}\n`;
    content += `Last Updated: ${formatDateTime(entry.updatedAt)}\n`;
    content += `Version: ${entry.version}\n\n`;
  }
  
  if (options.includeTags && entry.tags.length > 0) {
    content += `Tags: ${entry.tags.join(', ')}\n\n`;
  }
  
  // Convert markdown to plain text
  const plainContent = entry.content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
    .replace(/\n{2,}/g, '\n\n'); // Normalize line breaks
  
  content += plainContent;
  
  if (options.includeImages && entry.images.length > 0) {
    content += `\n\nImages:\n`;
    entry.images.forEach((image, index) => {
      content += `${index + 1}. ${image}\n`;
    });
  }
  
  return content;
}

function formatEntryForExport(entry: Entry, options: ExportOptions): any {
  const exportData: any = {
    title: entry.title,
    content: entry.content,
    summary: entry.summary,
  };
  
  if (options.includeMetadata) {
    exportData.createdAt = entry.createdAt;
    exportData.updatedAt = entry.updatedAt;
    exportData.version = entry.version;
  }
  
  if (options.includeTags) {
    exportData.tags = entry.tags;
  }
  
  if (options.includeImages) {
    exportData.images = entry.images;
  }
  
  return exportData;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getExportFilename(entry: Entry, format: string): string {
  const sanitizedTitle = entry.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  return `${sanitizedTitle}_${date}.${format}`;
}

export function getExportFilenameMultiple(format: string, count: number): string {
  const date = new Date().toISOString().split('T')[0];
  return `project_diary_entries_${count}_${date}.${format}`;
}

export function getMimeType(format: string): string {
  switch (format) {
    case 'markdown':
      return 'text/markdown';
    case 'json':
      return 'application/json';
    case 'txt':
      return 'text/plain';
    default:
      return 'text/plain';
  }
}