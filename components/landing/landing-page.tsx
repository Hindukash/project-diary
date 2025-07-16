"use client";

import { useState } from "react";
import { AuthModal } from "@/components/auth";
import { BookOpen, Shield, Users, Search, Tags, Calendar, ArrowRight, Star } from "lucide-react";

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  const handleGetStarted = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const features = [
    {
      icon: <BookOpen className="text-blue-500" size={24} />,
      title: "Rich Text Journaling",
      description: "Write detailed entries with markdown support, images, and rich formatting options."
    },
    {
      icon: <Tags className="text-green-500" size={24} />,
      title: "Smart Organization",
      description: "Organize your thoughts with custom tags, categories, and powerful search functionality."
    },
    {
      icon: <Shield className="text-purple-500" size={24} />,
      title: "Secure & Private",
      description: "Your personal diary is encrypted and secure. Only you can access your entries."
    },
    {
      icon: <Search className="text-orange-500" size={24} />,
      title: "Advanced Search",
      description: "Find any entry instantly with full-text search, date filters, and tag-based queries."
    },
    {
      icon: <Calendar className="text-red-500" size={24} />,
      title: "Timeline View",
      description: "Browse your entries chronologically and track your personal growth over time."
    },
    {
      icon: <Users className="text-indigo-500" size={24} />,
      title: "Multi-User Support",
      description: "Each user gets their own private space with complete data isolation."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="text-blue-600 dark:text-blue-400 mr-3" size={32} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Project Diary
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignIn}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Your Personal
            <span className="text-blue-600 dark:text-blue-400"> Digital Diary</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Capture your thoughts, track your progress, and organize your life with Project Diary. 
            A secure, feature-rich journaling platform designed for the modern digital age.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Start Writing Today
              <ArrowRight size={20} />
            </button>
            <button
              onClick={handleSignIn}
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Everything You Need to Journal
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to make journaling effortless, organized, and secure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 ml-3">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                100%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Private & Secure
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                ∞
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Unlimited Entries
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Access Anywhere
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust Project Diary with their thoughts and memories.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            Create Your Account
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="text-blue-600 dark:text-blue-400 mr-2" size={24} />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Project Diary
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              © 2025 Project Diary. Secure journaling for everyone.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}