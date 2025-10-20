"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import ChangePasswordWrapper from "@/components/auth/ChangePasswordWrapper";

/**
 * Provider for modals that need NextIntl context
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const { user, showPasswordChange, setShowPasswordChange } = useAuth();
  
  return (
    <>
      {children}
      {/* Password Change Modal - inside NextIntlClientProvider */}
      {user && showPasswordChange && (
        <ChangePasswordWrapper
          isOpen={showPasswordChange}
          onClose={() => setShowPasswordChange(false)}
          isFirstTime={user.needs_password_change || false}
        />
      )}
    </>
  );
}