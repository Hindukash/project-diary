export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string
          title: string
          content: string
          summary: string | null
          images: Json
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary?: string | null
          images?: Json
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: string | null
          images?: Json
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      entry_tags: {
        Row: {
          entry_id: string
          tag_id: string
        }
        Insert: {
          entry_id: string
          tag_id: string
        }
        Update: {
          entry_id?: string
          tag_id?: string
        }
      }
      entry_history: {
        Row: {
          id: string
          entry_id: string
          title: string
          content: string
          version: number
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          title: string
          content: string
          version: number
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          title?: string
          content?: string
          version?: number
          created_at?: string
        }
      }
    }
  }
}