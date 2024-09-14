'use client';

import Head from 'next/head';
import Image from 'next/image';
import * as React from 'react';

import { useTranslations } from 'next-intl';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  const t = useTranslations('Index');

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <Head key="login">
        <title>Rimori</title>
      </Head>

      <div className="flex-1 flex flex-col md:flex-row">
        <div
          className="hidden md:flex flex-1 items-center justify-center relative p-6 md:p-12 lg:p-24 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/login-bg.png")',
          }}
        >
          <div className="relative bg-white bg-opacity-50 rounded-lg p-6 flex flex-col items-start max-w-lg mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-4 mr-24">
              {t('Unlock your AI learning journey today and propel your academic success to new heights!')}
            </p>
            <Image
              src="/login-sphere.png"
              alt="Sphere Graphic"
              width={60}
              height={60}
              className="absolute bottom-4 left-[-30px] lg:left-[-40px]"
            />
            <Image
              src="/login-avatar.png"
              alt="Woman Graphic"
              width={300}
              height={350}
              className="absolute bottom-0 right-[-30px] lg:right-[-65px] h-auto w-auto"
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 bg-white relative">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={80}
            height={80}
            className="absolute top-6 left-6"
          />

          <div className="text-center max-w-xs w-full">
            <AuthForm />
          </div>
        </div>
      </div>
    </main>
  );
}
