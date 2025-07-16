"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  validatePassword, 
  getPasswordStrengthColor, 
  getPasswordStrengthTextColor, 
  PasswordStrength 
} from "@/lib/password-validation";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true, 
  className 
}: PasswordStrengthIndicatorProps) {
  const strength = validatePassword(password);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Password strength
          </span>
          {strength.label && (
            <span className={cn("text-xs font-medium", getPasswordStrengthTextColor(strength.score))}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-200",
                index < strength.score 
                  ? getPasswordStrengthColor(strength.score)
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1">
          {strength.requirements.map((requirement) => (
            <div
              key={requirement.id}
              className="flex items-center space-x-2 text-xs"
            >
              <div className={cn(
                "w-3 h-3 rounded-full flex items-center justify-center",
                requirement.met 
                  ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              )}>
                {requirement.met ? (
                  <Check size={8} />
                ) : (
                  <X size={8} />
                )}
              </div>
              <span className={cn(
                "transition-colors duration-200",
                requirement.met 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}