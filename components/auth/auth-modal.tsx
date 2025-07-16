"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { ForgotPasswordForm } from "./forgot-password-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot-password">(initialMode);

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchToLogin = () => {
    setMode("login");
  };

  const handleSwitchToSignup = () => {
    setMode("signup");
  };

  const handleForgotPassword = () => {
    setMode("forgot-password");
  };

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Sign In";
      case "signup":
        return "Sign Up";
      case "forgot-password":
        return "Reset Password";
      default:
        return "Sign In";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      className="max-w-md"
    >
      {mode === "login" && (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToSignup={handleSwitchToSignup}
          onForgotPassword={handleForgotPassword}
        />
      )}
      {mode === "signup" && (
        <SignupForm
          onSuccess={handleSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {mode === "forgot-password" && (
        <ForgotPasswordForm
          onSuccess={handleSuccess}
          onBackToLogin={handleSwitchToLogin}
        />
      )}
    </Modal>
  );
}