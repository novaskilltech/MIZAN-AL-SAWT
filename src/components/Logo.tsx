'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const dimensions = {
    sm: { img: 32, textTitle: 'text-sm', textSub: 'text-[10px]' },
    md: { img: 42, textTitle: 'text-base', textSub: 'text-[11px]' },
    lg: { img: 64, textTitle: 'text-2xl', textSub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative rounded-2xl overflow-hidden border border-sky-500/30 shadow-lg shadow-sky-950/50 bg-[#0B132B] flex items-center justify-center shrink-0">
        <Image
          src="/logo.jpg"
          alt="Mīzān al-Ṣawt Logo"
          width={dimensions.img}
          height={dimensions.img}
          className="object-cover"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-bold tracking-tight text-white ${dimensions.textTitle}`}>
              Mīzān al-Ṣawt
            </span>
            <span className="text-amber-400 font-arabic text-sm font-normal">
              ميزان الصوت
            </span>
          </div>
          <span className={`text-slate-400 block -mt-0.5 ${dimensions.textSub}`}>
            Miroir vocal & Justesse pour la récitation
          </span>
        </div>
      )}
    </div>
  );
};
