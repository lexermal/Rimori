'use client';

import { usePathname } from '@/i18n';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { SupabaseClient } from '@/utils/supabase/server';

export function CustomNavbar(): JSX.Element {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = SupabaseClient.getClient();

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getUser();

      if (!error) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, [supabase]);

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace(`/${locale}/auth/login`);
    }
  };

  return (
    <Navbar fluid rounded>
      <Navbar.Brand href={`/${locale}`}>
        <div
          className="mr-3 h-16 w-40 overflow-hidden"
          style={{
            backgroundImage: 'url("/logo.svg")',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundColor: 'white',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </Navbar.Brand>

      <div className="flex md:order-2">


        {user && <Dropdown
          className='mx-1'
          arrowIcon={false}
          inline
          label={
            <span className="font-medium text-gray-600 dark:text-gray-300 bg-gray-200 rounded-full p-1">{getAccount(user)}</span>
          }
        >
          <Dropdown.Header>
            <span className="block text-sm">{user?.user_metadata.name ?? 'Profile'}</span>
            <span className="block truncate text-sm font-medium">{user.email}</span>
          </Dropdown.Header>
          {/* <Dropdown.Item>Invite friends</Dropdown.Item> */}
          {/* <Dropdown.Divider /> */}
          <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
        </Dropdown>}
        <Navbar.Toggle />

      </div>

      <Navbar.Collapse>
        {/* Centered "Support" link */}
        <Navbar.Link href="https://discord.gg/7ZSAGWSk" active={pathname === `/${locale}`}>
          Support
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}

function getAccount(user: User): string | undefined {
  if (!user.user_metadata.name) {
    return user?.email?.slice(0, 2).toUpperCase();
  }

  const nameParts = user.user_metadata.name.split(" ");
  return nameParts[0][0].toUpperCase() + " " + nameParts[1][0].toUpperCase();
}
