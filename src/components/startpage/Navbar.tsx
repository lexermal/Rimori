'use client';

import { usePathname } from '@/i18n';
import { Navbar, Button } from 'flowbite-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export function CustomNavbar() {
  const locale = useLocale();
  const pathname = usePathname();

  if (pathname.startsWith(`/${locale}/auth`)) {
    return null;
  }

  const router = useRouter();
  const { logout } = useUser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);


  const handleLogout = () => {
    logout();
    router.replace(`/${locale}/auth/login`);
  };

  return (
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
  );
}
