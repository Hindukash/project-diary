import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Helper function to get current authenticated user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to require authentication
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Helper function to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

// Helper function to ensure operation is performed by authenticated user
export async function withAuth<T>(operation: (user: User) => Promise<T>): Promise<T> {
  const user = await requireAuth();
  return await operation(user);
}

// Check if current user owns a resource
export async function userOwnsResource(table: string, resourceId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from(table)
    .select('user_id')
    .eq('id', resourceId)
    .single();

  if (error) {
    console.error(`Error checking resource ownership:`, error);
    return false;
  }

  return data?.user_id === user.id;
}

// Get user's session
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}