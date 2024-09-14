import { createInstance } from '@jonkoops/matomo-tracker-react';

let matomoInstance: any;
let currentUserId: string | undefined;

export const getMatomoInstance = (backendUrl: string, userId?: string) => {
  if (userId !== currentUserId) {
    currentUserId = userId;
    matomoInstance = createInstance({
      urlBase: backendUrl,
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
