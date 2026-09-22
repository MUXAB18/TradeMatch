import React from 'react';
import { MessagesProvider } from '@/contexts/MessagesContext';
import { MessagesLayout } from '@/components/messages/MessagesLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | TradeMatch',
  description: 'Connect and communicate with your network.',
};

export default function MessagesPage() {
  return (
    <MessagesProvider>
      <MessagesLayout />
    </MessagesProvider>
  );
}
