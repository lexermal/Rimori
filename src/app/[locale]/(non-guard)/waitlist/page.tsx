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
        let errorMessage = t('Failed to add you to the waitlist Please try again');
        if (error.code === '23505') {
          errorMessage = t('You have already been registered to the waitlist We will contact you when Rimori is available for you');
        }
        setStatusMessage({
          status: Status.Error,
          message: errorMessage,
        });
      }
    } catch (error) {
      setStatusMessage({
        status: Status.Error,
        message: t('An error occurred Please try again later'),
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#406d46] to-[#5e6b20] p-4">
      <Head>
        <title>{t('Join Our Waitlist')}</title>
      </Head>
      <h1 className="text-4xl font-bold mb-4 text-white">{t('Rimori will soon be available at your university!')}</h1>
      <p className="text-lg mb-6 text-gray-300 font-semibold">{t('Till then, how about staying updated?')}</p>

      <div className="w-full max-w-md p-8">
        {!emailParam && (
          <div className="mb-4">
            <input
              id="email"
              type="email"
              placeholder="john.doe@university.edu"
              value={email}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 w-full rounded-lg"
              required
            />
          </div>
        )}
        {statusMessage.status === Status.Error && <p className="text-red-500 text-sm mb-4">{statusMessage.message}</p>}
        {statusMessage.status === Status.Success && <p className="text-green-500 text-sm mb-4">{statusMessage.message}</p>}

        <div className="flex justify-center align-middle space-x-4 mt-6">
          <button
            className="bg-white text-black font-semibold p-2 rounded-lg hover:bg-gray-100 transition duration-300"
            onClick={handleClick}
          >
            {t('Sign me up!')}
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white p-2 rounded-lg hover:bg-gray-100 transition duration-300"
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
