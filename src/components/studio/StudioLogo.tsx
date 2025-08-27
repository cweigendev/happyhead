'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const StudioLogo: React.FC = () => {
  return (
    <div
      className="fixed z-20"
      style={{
        top: '20px',
        left: '20px',
      }}
    >
      <Link href="/" className="hover:opacity-80 transition-opacity duration-200 block">
        <Image 
          src="/applogo/hhs.png" 
          alt="HHS Logo" 
          width={120}
          height={120}
          className="rounded-lg shadow-lg"
          priority
        />
      </Link>
    </div>
  );
};

export default StudioLogo;
