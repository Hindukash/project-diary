"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Save, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  onClose?: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile({ full_name: fullName.trim() });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          User Profile
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              id="email"
              type="email"
              value={user?.email || ""}
              className={cn(
                "w-full pl-10 pr-4 py-2 border rounded-md transition-colors",
                "border-gray-300 dark:border-gray-600",
                "bg-gray-50 dark:bg-gray-700",
                "text-gray-500 dark:text-gray-400",
                "cursor-not-allowed"
              )}
              disabled
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className={cn(
                "w-full pl-10 pr-4 py-2 border rounded-md transition-colors",
                "border-gray-300 dark:border-gray-600",
                "bg-white dark:bg-gray-800",
                "text-gray-900 dark:text-gray-100",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "flex-1 py-2 px-4 rounded-md font-medium transition-colors",
              "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400",
              "text-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Save className="mr-2" size={18} />
                Save
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-md font-medium transition-colors",
              "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
              "text-gray-700 dark:text-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
              "disabled:cursor-not-allowed"
            )}
          >
            <LogOut size={18} />
          </button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Member since {new Date(user?.created_at || "").toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}