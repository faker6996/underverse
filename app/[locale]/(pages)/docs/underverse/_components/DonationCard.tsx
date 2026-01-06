"use client";

import React, { useState } from "react";
import { Heart, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const BANK_INFO = {
  name: "Trần Văn Bách",
  bank: "Techcombank",
  accountNumber: "19071075977013",
  qrImage: "/images/donate-qr.png",
};

export default function DonationCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden 2xl:block">
      <div className="p-3 rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <h4 className="text-xs font-semibold text-foreground">Support this project</h4>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-3">
          <div className="p-1.5 bg-background border border-border rounded-lg">
            <img src={BANK_INFO.qrImage} alt="Donation QR Code" className="w-28 h-28 object-contain" />
          </div>
        </div>

        {/* Bank Info */}
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bank:</span>
            <span className="font-medium text-foreground">{BANK_INFO.bank}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium text-foreground">{BANK_INFO.name}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Account:</span>
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors",
                copied ? "bg-primary/20 text-primary" : "bg-muted text-foreground hover:bg-accent"
              )}
            >
              {BANK_INFO.accountNumber}
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <p className="mt-2 text-[10px] text-muted-foreground text-center">Thank you! 🙏</p>
      </div>
    </div>
  );
}
