import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    default_tags: string[];
    notifications: {
      email: boolean;
      browser: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

// Authentication functions
export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string, rememberMe = false) {
    // Store remember me preference
    if (rememberMe) {
      localStorage.setItem('auth_remember_me', 'true');
    } else {
      localStorage.removeItem('auth_remember_me');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Sign out
  async signOut() {
    // Clear remember me preference
    localStorage.removeItem('auth_remember_me');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return session;
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }

    return user;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  // Update password
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Get remember me preference
  getRememberMe() {
    return localStorage.getItem('auth_remember_me') === 'true';
  },
};

// User profile functions
export const userProfile = {
  // Get user profile
  async getProfile(userId?: string): Promise<UserProfile | null> {
    const id = userId || (await auth.getUser())?.id;
    
    if (!id) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  },

  // Create or update user profile
  async upsertProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const user = await auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        ...profile,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Update user preferences
  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<UserProfile> {
    const user = await auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const currentProfile = await this.getProfile();
    
    if (!currentProfile) {
      throw new Error('User profile not found');
    }

    const updatedPreferences = {
      ...currentProfile.preferences,
      ...preferences,
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        preferences: updatedPreferences,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    const user = await auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    await this.upsertProfile({
      avatar_url: data.publicUrl,
    });

    return data.publicUrl;
  },
};

// Utility functions
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return Boolean(supabase.auth.getUser());
  },

  // Get current user ID
  async getCurrentUserId(): Promise<string | null> {
    const user = await auth.getUser();
    return user?.id || null;
  },

  // Check if email is valid
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check if password is strong enough
  isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Format auth error messages
  formatAuthError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link.';
      case 'User already registered':
        return 'An account with this email already exists.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      default:
        return error.message;
    }
  },
};