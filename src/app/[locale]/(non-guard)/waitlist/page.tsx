"use client";

import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/server';

enum Status {
  Idle,
  Loading,
  Success,
  Error,
}

const WaitlistPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [statusMessage, setStatusMessage] = useState({
    status: Status.Idle,
    message: '',
  });

  const t = useTranslations('Index');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleClick = async () => {
    if (!email) {
      setStatusMessage({
        status: Status.Error,
        message: t('Please enter a valid email address'),
      });
      return;
    }

    setStatusMessage({
      status: Status.Loading,
      message: '',
    });

    try {
      const supabase = createClient();
      const { error } = await supabase.from('waitlist').insert({ email });

      if (!error) {
        setStatusMessage({
          status: Status.Success,
          message: t('You have been added to the waitlist!'),
        });
        setEmail('');
      } else {
        let errorMessage = t('Failed to add you to the waitlist. Please try again.');
        if (error.code === '23505') {
          errorMessage = t('You have already been registered to the waitlist. We will contact you when Rimori is available for you.');
        }
        setStatusMessage({
          status: Status.Error,
          message: errorMessage,
        });
      }
    } catch (error) {
      setStatusMessage({
        status: Status.Error,
        message: t('An error occurred. Please try again later.'),
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-500 via-teal-500 to-blue-500 p-6">
      <Head>
        <title>{t('Join Our Waitlist')}</title>
      </Head>

      <div className="w-full max-w-lg text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-6 animate-fadeIn">{t('Rimori will soon be available at your university!')}</h1>
        <p className="text-lg text-gray-200 mb-8">{t('Till then, stay updated by joining our waitlist')}</p>

        {!emailParam && (
          <div className="mb-6">
            <input
              id="email"
              type="email"
              placeholder="john.doe@university.edu"
              value={email}
              onChange={handleInputChange}
              className="w-full p-4 text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              required
            />
          </div>
        )}

        {statusMessage.status === Status.Error && <p className="text-red-500 mb-4">{statusMessage.message}</p>}
        {statusMessage.status === Status.Success && <p className="text-green-500 mb-4">{statusMessage.message}</p>}

        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            className="bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
            onClick={handleClick}
            disabled={statusMessage.status === Status.Loading}
          >
            {statusMessage.status === Status.Loading ? t('Signing you up...') : t('Sign me up!')}
          </button>

          <button
            type="button"
            className="bg-white/80 text-gray-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-white hover:text-gray-700 transition-all duration-300 ease-in-out"
            onClick={() => router.replace('/')}
          >
            {t('Go to homepage')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
