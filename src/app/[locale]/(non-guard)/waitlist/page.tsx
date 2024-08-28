"use client";

import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
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
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [message, setMessage] = useState('');
  const t = useTranslations('Index');

  const handleClick = async () => {
    if (!email) {
      setMessage(t('Please enter a valid email address.'));
      return;
    }

    setStatus(Status.Loading);
    setMessage('');

    try {
      const supabase = createClient();

      const { error } = await supabase.from('waitlist').insert({ email })

      if (!error) {
        setStatus(Status.Success);
        setMessage(t('You have been added to the waitlist!'));
        setEmail('');
      } else {
        setStatus(Status.Error);
        console.error('Failed to add to waitlist:', error);
        setMessage(t('Failed to add you to the waitlist. Please try again.'));
      }
    } catch (error) {
      setStatus(Status.Error);
      setMessage(t('An error occurred. Please try again.'));
    }
  };

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

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
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg"
              required
            />
          </div>
        )}
        {status === Status.Error && <p className="text-red-500 text-sm mb-4">{message}</p>}
        {status === Status.Success && <p className="text-green-500 text-sm mb-4">{message}</p>}

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
            onClick={() => router.push('/learn-more')}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
