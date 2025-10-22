"use client";

import React from 'react';
import { LanguageSwitcher } from '@underverse-ui/underverse';
import { useRouter, usePathname } from 'next/navigation';

const locales = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function LanguageSwitcherHeadlessExample() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = React.useMemo(() => pathname.split('/')[1] || 'vi', [pathname]);

  const onSwitch = (code: string) => {
    const segs = pathname.split('/');
    segs[1] = code;
    router.push(segs.join('/'));
  };

  return (
    <LanguageSwitcher locales={locales} currentLocale={currentLocale} onSwitch={onSwitch} />
  );
}

