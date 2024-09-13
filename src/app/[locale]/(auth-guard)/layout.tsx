"use client";

import { CustomNavbar } from '@/components/startpage/Navbar';
import { createClient } from '@/utils/supabase/server';
import { MatomoProvider } from '@jonkoops/matomo-tracker-react';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import useAnalytics from '@/hooks/useAnalytics';

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const matomoInstance = useAnalytics(user);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setUser(data.user);
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    <MatomoProvider value={matomoInstance}>
      <CustomNavbar />
      {children}
    </MatomoProvider>
  );
}
