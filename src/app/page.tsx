'use client';

import Head from 'next/head';
import * as React from 'react';

import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

import { useUser } from '@/context/UserContext';

export default function HomePage() {
  const { user, logout } = useUser();

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <Head>
        <title>RIAU</title>
      </Head>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to RIAU</h2>
          <p className="text-gray-700 mb-4">{user ? `Welcome back ${user.name}` : "Please log in or sign up to continue."}</p>

          {user ? <div className="flex justify-center items-center space-x-4">
            <button
              onClick={logout}
              className="btn btn-danger px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          </div> : <GoogleAuthButton />}

        </div>
      </div>
    </main>
  );
}
