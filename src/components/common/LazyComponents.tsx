'use client';

import dynamic from 'next/dynamic';

export const LazyChatWidget = dynamic(
  () => import('@/components/chat/ChatWidget').then((mod) => ({ default: mod.ChatWidget })),
  { loading: () => null, ssr: false }
);
