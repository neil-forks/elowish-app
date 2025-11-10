'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: host || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded');
          }
        },
      });

      // Make posthog available globally for event tracking
      if (typeof window !== 'undefined') {
        (window as any).posthog = posthog;
      }
    } else {
      console.warn('PostHog API key not found. Analytics will not be tracked.');
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
