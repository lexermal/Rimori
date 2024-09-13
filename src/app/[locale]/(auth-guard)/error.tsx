'use client';

import { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';
import { createClient } from '@/utils/supabase/server';
import { getMatomoInstance } from '@/utils/matomo';
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const [matomoInstance, setMatomoInstance] = useState(getMatomoInstance());
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const instance = getMatomoInstance(user?.id);
    setMatomoInstance(instance);
  }, [user?.id]);

  useEffect(() => {
    if (matomoInstance && error) {
      const timestamp = new Date().toISOString();

      matomoInstance.trackEvent({
        category: 'Error',
        action: 'Global error',
        name: error.message,
        value: error.digest || 'No digest',
        customDimension: {
          timestamp,
          pathname
        },
      });
    }
  }, [error, matomoInstance]);

  return (
    <main>
      <section className='bg-white'>
        <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
          <RiAlarmWarningFill
            size={60}
            className='drop-shadow-glow animate-flicker text-red-500'
          />
          <h1 className='mt-8 text-4xl md:text-6xl'>
            Oops, something went wrong!
          </h1>
          <button
            onClick={reset}
            className='mt-6 rounded-lg bg-red-500 px-4 py-2 text-white'>
            Try Again
          </button>
        </div>
      </section>
    </main>
  );
}
