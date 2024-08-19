'use client';
import { Models } from 'appwrite';
import cookie from 'cookie';
import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { AppwriteSingleton } from '@/app/appwrite';

interface UserContextType {
  user: Models.User<Models.Preferences> | null;
  setUser: React.Dispatch<React.SetStateAction<Models.User<Models.Preferences> | null>>;
  logout: () => Promise<void>;
}

interface Props {
  children: ReactNode,
  allowedDomains: string[],
  apiEndpoint: string,
  projectId: string
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<Props> = ({ children, allowedDomains, apiEndpoint, projectId }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  AppwriteSingleton.init(apiEndpoint, projectId);
  const account = AppwriteSingleton.getAccount();
  const router = useRouter();

  const getLocaleFromCookie = (): string => {
    if (typeof document !== 'undefined') {
      const cookies = cookie.parse(document.cookie);
      return cookies.NEXT_LOCALE || 'en';
    }
    return 'en';
  };

  useEffect(() => {
    const locale = getLocaleFromCookie();

    const fetchUser = async () => {
      try {
        const userData = await account.get();
        const userDomain = userData.email.split('@')[1];

        if (!allowedDomains.includes(userDomain)) {
          await account.deleteSession('current');
          router.push(`/${locale}/waitlist?email=${encodeURIComponent(userData.email)}`);
        } else {
          const encryptedUserData = (await account.createJWT()).jwt;
          const tokenUser = { ...userData, jwt: encryptedUserData };
          setUser(tokenUser);
          document.cookie = cookie.serialize('auth_user', '1', {
            httpOnly: false,
            secure: true,
            maxAge: 60 * 60 * 24 * 7, // Cookie expires in 1 week, but check to adapt to appwrite session
            path: '/',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUser();
  }, [router]);

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);

      document.cookie = cookie.serialize('auth_user', '', {
        httpOnly: false,
        secure: true,
        expires: new Date(0),
        path: '/',
      });

      // Also remove 'user_session' cookie if needed
      document.cookie = cookie.serialize('user_session', '', {
        httpOnly: false,
        secure: true,
        expires: new Date(0),
        path: '/',
      });
      // router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
