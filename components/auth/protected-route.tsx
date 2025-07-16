"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import { LandingPage } from "@/components/landing/landing-page";
import { cn } from "@/lib/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading Project Diary...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <LandingPage />;
  }

  // Check if user's email is confirmed
  if (user && !user.email_confirmed_at) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto p-6">
          <div className="text-center mb-8">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Email confirmation required
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Please confirm your email address to access Project Diary
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Confirmation email sent to:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>What to do next:</strong>
              </p>
              <ol className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 list-decimal list-inside space-y-1">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the confirmation link in the email</li>
                <li>Refresh this page or sign in again</li>
              </ol>
            </div>

            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "px-4 py-2 rounded-md font-medium transition-colors",
                  "bg-blue-600 hover:bg-blue-700",
                  "text-white",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                )}
              >
                I've confirmed my email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}