import { NEXT_PUBLIC_MATOMO_URL } from '@/utils/constants';
import { createInstance } from '@jonkoops/matomo-tracker-react';

let matomoInstance: any;
let currentUserId: string | undefined;

export const getMatomoInstance = (userId?: string) => {
  if (userId !== currentUserId) {
    currentUserId = userId;
    matomoInstance = createInstance({
      urlBase: NEXT_PUBLIC_MATOMO_URL,
      siteId: 1,
      userId,
      disabled: false,
      heartBeat: {
        active: true,
        seconds: 15
      },
      linkTracking: true,
      configurations: {
        disableCookies: true,
        setSecureCookie: true,
        setRequestMethod: 'POST'
      }
    });
  }

  return matomoInstance;
};
