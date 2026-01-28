"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

function normalizeUrl(raw: string) {
  const url = raw.trim();
  if (!url) return "";

  // Keep absolute URLs, protocol URLs, anchors, and relative paths as-is.
  if (url.startsWith("#") || url.startsWith("/")) return url;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;

  // Otherwise treat it like a hostname and default to https.
  return `https://${url}`;
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
  const t = useTranslations("UEditor");
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (normalized) onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
      <input
        ref={inputRef}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t("linkInput.placeholder")}
        className="flex-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button type="submit" className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
        <Check className="w-4 h-4" />
      </button>
      <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
        <X className="w-4 h-4" />
      </button>
    </form>
  );
};

export const ImageInput = ({ onSubmit, onCancel }: { onSubmit: (url: string, alt?: string) => void; onCancel: () => void }) => {
  const t = useTranslations("UEditor");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onSubmit(url, alt);
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
          className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t("imageInput.altLabel")}</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder={t("imageInput.altPlaceholder")}
          className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
