"use client";

import { useTranslations } from "next-intl";
import ChangePasswordModal from "./ChangePasswordModal";

interface ChangePasswordWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

export default function ChangePasswordWrapper(props: ChangePasswordWrapperProps) {
  const t = useTranslations("ProfilePage");
  
  // Safe translation function with fallbacks
  const safeT = (key: string, fallback: string) => {
    try {
      return t(key as any);
    } catch (error) {
      console.warn(`Missing translation for key: ${key}`, error);
      return fallback;
    }
  };
  
  // Pass translations as props to avoid context issues
  const translations = {
    changePasswordRequired: safeT("changePasswordRequired", "Password Change Required"),
    changePassword: safeT("changePassword", "Change Password"),
    changePasswordMessage: safeT("changePasswordMessage", "For account security, you need to change the default password before continuing."),
    currentPassword: safeT("currentPassword", "Current Password"),
    newPassword: safeT("newPassword", "New Password"),
    confirmPassword: safeT("confirmPassword", "Confirm New Password"),
    enterCurrentPassword: safeT("enterCurrentPassword", "Enter current password"),
    enterNewPassword: safeT("enterNewPassword", "Enter new password (minimum 6 characters)"),
    confirmNewPassword: safeT("confirmNewPassword", "Confirm new password"),
    passwordMismatch: safeT("passwordMismatch", "Password confirmation does not match"),
    passwordTooShort: safeT("passwordTooShort", "New password must be at least 6 characters"),
    passwordChangeError: safeT("passwordChangeError", "An error occurred while changing password"),
    cancel: safeT("cancel", "Cancel"),
    updatePassword: safeT("updatePassword", "Update")
  };
  
  return <ChangePasswordModal {...props} translations={translations} />;
}