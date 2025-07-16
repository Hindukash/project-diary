"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchToLogin = () => {
    setMode("login");
  };

  const handleSwitchToSignup = () => {
    setMode("signup");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "login" ? "Sign In" : "Sign Up"}
      className="max-w-md"
    >
      {mode === "login" ? (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToSignup={handleSwitchToSignup}
        />
      ) : (
        <SignupForm
          onSuccess={handleSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </Modal>
  );
}