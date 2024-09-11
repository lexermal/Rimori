
"use client";

import EmitterSingleton from '@/app/[locale]/(auth-guard)/discussion/components/Emitter';
import { CustomNavbar } from '@/components/startpage/Navbar';
import { getMatomoInstance } from '@/utils/matomo';
import { createClient } from '@/utils/supabase/server';
import { MatomoProvider } from '@jonkoops/matomo-tracker-react'
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const pathname = usePathname();
  const [matomoInstance, setMatomoInstance] = useState(getMatomoInstance());

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const instance = getMatomoInstance(user?.id);
    setMatomoInstance(instance);
  }, [user?.id]);

  useEffect(() => {
    if (matomoInstance) {
      matomoInstance.trackPageView();
    }
  }, [pathname, matomoInstance]);


  // handle all events in here
  useEffect(() => {
    if (matomoInstance) {
      const handleUserClickEvent = (data: any) => {
        matomoInstance.trackEvent({
          category: 'Analytics',
          action: 'click',
          name: data.key,
          customDimension: {
            timestamp: new Date().toISOString(),
          },
        });
      };

      EmitterSingleton.on('analytics-click-event', handleUserClickEvent);

      return () => {
        EmitterSingleton.off('analytics-click-event', handleUserClickEvent);
      };
    }

  }, [matomoInstance]);

  return (
    <MatomoProvider value={matomoInstance}>
      <CustomNavbar />
      {children}
    </MatomoProvider>
  );
}