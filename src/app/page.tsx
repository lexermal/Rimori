'use client';

import Head from 'next/head';
import * as React from 'react';

export default function HomePage() {
  //forward to /go
  React.useEffect(() => {
    window.location.href = '/go';
  }, []);
  return (
    <main>
      <Head>
        <title>RIAU</title>
      </Head>
      {/* <section className='bg-white'>
        Under construction. The supages are directly accessible.
      </section> */}
    </main>
  );
}
