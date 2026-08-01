"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { Check, X } from "lucide-react";
import { sanitizeUEditorUrl } from "./url-safety";
import { formControlOutlineClass } from "../../constants/form-control-size";

function normalizeUrl(raw: string) {
  return sanitizeUEditorUrl(raw, "link");
}

export const LinkInput = ({
  onSubmit,
  onCancel,
  initialUrl = "",
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
  initialUrl?: string;
}) => {
  const t = useSmartTranslations("UEditor");
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError(t("linkInput.invalid"));
      return;
    }

    setError("");
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          placeholder={t("linkInput.placeholder")}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`flex-1 rounded-lg bg-muted/50 px-3 py-2 text-sm ${formControlOutlineClass} aria-invalid:border-destructive`}
        />
        <button type="submit" className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Check className="w-4 h-4" />
        </button>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error ? <p id={errorId} role="alert" className="mt-1.5 px-1 text-xs text-destructive">{error}</p> : null}
    </form>
  );
};

export const ImageInput = ({ onSubmit, onCancel }: { onSubmit: (url: string, alt?: string) => void; onCancel: () => void }) => {
  const t = useSmartTranslations("UEditor");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeUrl = sanitizeUEditorUrl(url, "image");
    if (safeUrl) {
      onSubmit(safeUrl, alt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t("imageInput.urlLabel")}</label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("imageInput.urlPlaceholder")}
          className={`mt-1 w-full rounded-lg bg-muted/50 px-3 py-2 text-sm ${formControlOutlineClass}`}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t("imageInput.altLabel")}</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder={t("imageInput.altPlaceholder")}
          className={`mt-1 w-full rounded-lg bg-muted/50 px-3 py-2 text-sm ${formControlOutlineClass}`}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!url}
          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {t("imageInput.addBtn")}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          {t("imageInput.cancelBtn")}
        </button>
      </div>
    </form>
  );
};
