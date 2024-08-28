'use client';

import { usePathname } from '@/i18n';
import { Navbar, Button } from 'flowbite-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export function CustomNavbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace(`/${locale}/auth/login`);
    }
  };

  return (
    <div className='mb-24'>
      <Navbar rounded className="fixed w-full top-0 bg-white shadow-md">
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

        <div className="flex md:order-2 items-center">
          {user && (
            <Button color="light" onClick={handleLogout} className="btn-sm mr-3">
              Logout
            </Button>
          )}
          <Navbar.Toggle />
        </div>

        <Navbar.Collapse>
          <Navbar.Link href={`/${locale}`} active={pathname === `/${locale}`}>
            Home
          </Navbar.Link>
          {/* Add more Navbar links here if needed */}
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
