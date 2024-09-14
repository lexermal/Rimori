import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import EmitterSingleton from '@/app/[locale]/(auth-guard)/discussion/components/Emitter';
import { getMatomoInstance } from '@/utils/matomo';
import { User } from '@supabase/supabase-js';
import { useEnv } from '@/providers/EnvProvider';

interface AnalyticsData {
  category?: string;
  action?: string;
  name?: string;
}

const useAnalytics = (user: User | null) => {
  const env = useEnv();
  const [matomoInstance, setMatomoInstance] = useState(getMatomoInstance(env.MATOMO_URL));
  const pathname = usePathname();

  useEffect(() => {
    const instance = getMatomoInstance(env.MATOMO_URL, user?.id);
    setMatomoInstance(instance);
  }, [user?.id]);

  useEffect(() => {
    if (matomoInstance) {
      matomoInstance.trackPageView();
    }
  }, [pathname, matomoInstance]);

  useEffect(() => {
    if (matomoInstance) {
      const handleUserClickEvent = (data: AnalyticsData) => {
        matomoInstance.trackEvent({
          category: data.category ?? 'Analytics',
          action: data.action ?? 'action',
          name: data.name ?? 'n/a',
          customDimension: {
            timestamp: new Date().toISOString(),
          },
        });
      };

      EmitterSingleton.on('analytics-event', handleUserClickEvent);

      return () => {
        EmitterSingleton.off('analytics-event', handleUserClickEvent);
      };
    }
  }, [matomoInstance]);

  return matomoInstance;
};

export default useAnalytics;
