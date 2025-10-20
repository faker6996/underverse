"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { callApi } from "@/lib/utils/api-client";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { useAuth } from "@/contexts/AuthContext";

interface ChangePasswordModalTranslations {
  changePasswordRequired: string;
  changePassword: string;
  changePasswordMessage: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  enterCurrentPassword: string;
  enterNewPassword: string;
  confirmNewPassword: string;
  passwordMismatch: string;
  passwordTooShort: string;
  passwordChangeError: string;
  cancel: string;
  updatePassword: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean; // true if user needs to change password on first login
  translations: ChangePasswordModalTranslations;
}

export default function ChangePasswordModal({ isOpen, onClose, isFirstTime = false, translations }: ChangePasswordModalProps) {
  const { refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError(translations.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      setError(translations.passwordTooShort);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await callApi(
        API_ROUTES.AUTH.ME,
        HTTP_METHOD_ENUM.PATCH,
        {
          // Use snake_case keys to match backend
          current_password: isFirstTime ? undefined : currentPassword,
          new_password: newPassword,
        }
      );

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Refresh user state instead of full page reload
      await refreshUser();
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      setError(error.message || translations.passwordChangeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isFirstTime ? () => {} : onClose} // Can't close if first time
      title={isFirstTime ? translations.changePasswordRequired : translations.changePassword}
      className="w-full max-w-md"
      showCloseButton={!isFirstTime}
      closeOnOverlayClick={!isFirstTime}
      closeOnEsc={!isFirstTime}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isFirstTime && (
          <p className="text-sm text-muted-foreground">
            {translations.changePasswordMessage}
          </p>
        )}
        
        {!isFirstTime && (
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
              {translations.currentPassword}
            </label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder={translations.enterCurrentPassword}
            />
          </div>
        )}
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
            {translations.newPassword}
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder={translations.enterNewPassword}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            {translations.confirmPassword}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder={translations.confirmNewPassword}
          />
        </div>
        
        {error && (
          <div className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded border border-destructive/20">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
          {!isFirstTime && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {translations.cancel}
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {isFirstTime ? translations.changePassword : translations.updatePassword}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
