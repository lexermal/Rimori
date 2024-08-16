"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

import { useUser } from '@/context/UserContext';

const AuthCallback = () => {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div style={styles.container}>
      <ClipLoader color="#000" loading={true} size={50} />
    </div>
  );
};

export default AuthCallback;

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};
