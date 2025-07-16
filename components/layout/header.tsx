"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Settings, User } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
  currentView?: string;
}

export function Header({ onSettingsClick, currentView }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Project Diary
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <button
          onClick={onSettingsClick}
          className={`p-2 rounded-lg transition-colors ${
            currentView === 'settings'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title="Settings"
        >
          <Settings size={20} />
        </button>
        
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <User size={18} />
          <span className="text-sm">User</span>
        </div>
      </div>
    </header>
  );
}