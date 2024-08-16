'use client';

import Head from 'next/head';
import Image from 'next/image';
import * as React from 'react';

import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const { user, logout } = useUser();

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <Head>
        <title>Rimori</title>
      </Head>

      <div className="flex-1 flex">
        <div className="hidden md:flex w-1/2 items-center justify-center relative p-32"
          style={{
            backgroundImage: 'url("/login-bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative bg-white bg-opacity-30 rounded-lg p-6 flex flex-col items-start min-h-[50vh] min-w-[100%]">
            <p className="text-3xl font-bold text-white mt-4 max-w-[325px]">
              Unlock your AI learning journey today and propel your academic success to new heights!
            </p>
            <Image
              src="/login-sphere.png"
              alt="Sphere Graphic"
              width={80}
              height={80}
              className="absolute bottom-4 left-[-40px]"
            />
            <Image
              src="/login-avatar.png"
              alt="Woman Graphic"
              width={350}
              height={420}
              className="absolute bottom-0 right-[-65px] h-auto w-auto"
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 bg-white relative">
          <Image
            src="/logo.png"
            alt="Sphere Graphic"
            width={80}
            height={80}
            className="absolute top-6 left-6"
          />

          <div className="text-center max-w-xs w-full">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>
            <p className="text-gray-700 mb-4">
              {user ? `Welcome back ${user.name}` : "Please log in or sign up to continue."}
            </p>
            {user ? (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={logout}
                  className="btn btn-danger px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <GoogleAuthButton />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
