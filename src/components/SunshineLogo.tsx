/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface SunshineLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textColor?: 'dark' | 'light';
  textSubTitle?: string;
  layout?: 'horizontal' | 'vertical';
}

const FULL_LOGO_SRC = '/assets/aistudio/logo_with_side_name_transparent.png';
const FULL_LOGO_LIGHT_SRC = '/assets/aistudio/logo_with_side_name_light_transparent.png';
const EMBLEM_LOGO_SRC = '/assets/aistudio/logo_emblem_transparent.png';
const EMBLEM_LOGO_LIGHT_SRC = '/assets/aistudio/logo_emblem_light_transparent.png';

export default function SunshineLogo({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'dark',
  textSubTitle,
  layout
}: SunshineLogoProps) {
  const [imgError, setImgError] = useState(false);

  const [retryCount, setRetryCount] = useState(0);

  // Compute pixel sizes
  const getIconSize = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm': return 32;
      case 'md': return 48;
      case 'lg': return 84;
      case 'xl': return 120;
      default: return 48;
    }
  };

  const iconSize = getIconSize();

  const getHeightClass = () => {
    if (typeof size === 'number') return '';
    switch (size) {
      case 'sm': return 'h-8 sm:h-9 max-h-9';
      case 'md': return 'h-10 sm:h-12 max-h-12';
      case 'lg': return 'h-16 sm:h-20 max-h-20';
      case 'xl': return 'h-20 sm:h-24 max-h-24';
      default: return 'h-10 sm:h-12 max-h-12';
    }
  };

  const isLightText = textColor === 'light';

  // Resilient source resolution
  const getLogoSrc = (isEmblem = false) => {
    if (isEmblem) {
      if (retryCount === 0) return isLightText ? EMBLEM_LOGO_LIGHT_SRC : EMBLEM_LOGO_SRC;
      return isLightText ? '/logo_emblem_light_transparent.png' : '/logo_emblem_transparent.png';
    }
    if (retryCount === 0) return isLightText ? FULL_LOGO_LIGHT_SRC : FULL_LOGO_SRC;
    if (retryCount === 1) return isLightText ? '/logo_with_side_name_light_transparent.png' : '/logo_with_side_name_transparent.png';
    return '/logo_transparent.png';
  };

  const handleImageError = () => {
    if (retryCount < 2) {
      setRetryCount((prev) => prev + 1);
    } else {
      setImgError(true);
    }
  };

  // Fallback vector SVG if image cannot be loaded
  const renderFallbackSvg = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 filter drop-shadow-xs"
    >
      <defs>
        <linearGradient id="fallbackSunGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="fallbackBookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2545" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <g id="sun-rays">
        <path d="M100 45 C100 20 95 10 100 5 C105 10 100 20 100 45 Z" fill="url(#fallbackSunGrad)" />
        <path d="M112 47 C122 25 125 15 132 12 C131 18 123 27 112 47 Z" fill="url(#fallbackSunGrad)" />
        <path d="M125 53 C145 35 152 30 161 31 C157 37 144 43 125 53 Z" fill="url(#fallbackSunGrad)" />
        <path d="M135 68 C165 58 174 58 184 62 C178 65 162 65 135 68 Z" fill="url(#fallbackSunGrad)" />
        <path d="M140 85 C175 88 185 92 192 101 C184 100 170 95 140 85 Z" fill="url(#fallbackSunGrad)" />
        <path d="M88 47 C78 25 75 15 68 12 C69 18 77 27 88 47 Z" fill="url(#fallbackSunGrad)" />
        <path d="M75 53 C55 35 48 30 39 31 C43 37 56 43 75 53 Z" fill="url(#fallbackSunGrad)" />
        <path d="M65 68 C35 58 26 58 16 62 C22 65 38 65 65 68 Z" fill="url(#fallbackSunGrad)" />
        <path d="M60 85 C25 88 15 92 8 101 C16 100 30 95 60 85 Z" fill="url(#fallbackSunGrad)" />
      </g>
      <path d="M60 90 A 45 45 0 0 1 140 90" stroke="url(#fallbackSunGrad)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M100 125 C65 105 30 115 15 130 L15 105 C30 90 65 80 100 105 Z" fill="url(#fallbackBookGrad)" />
      <path d="M100 125 C135 105 170 115 185 130 L185 105 C170 90 135 80 100 105 Z" fill="url(#fallbackBookGrad)" />
      <circle cx="100" cy="78" r="8" fill="#0B2545" />
      <path d="M100 120 C98 110 93 96 76 86 C88 90 95 98 100 110 C105 98 112 90 124 86 C107 96 102 110 100 120 Z" fill="#0B2545" />
    </svg>
  );

  // If error occurred loading image, render the vector fallback
  if (imgError) {
    return (
      <div id="sunshine-logo-fallback" className={`flex items-center gap-2.5 select-none bg-transparent shrink-0 ${className}`}>
        {renderFallbackSvg()}
        {showText && (
          <div className="flex flex-col shrink-0">
            <span className={`font-serif-brand font-black tracking-wider leading-none uppercase ${isLightText ? 'text-white' : 'text-[#0B2545]'}`}>
              SUNSHINE
            </span>
            <span className="font-sans font-black text-brand-orange tracking-widest text-[10px] uppercase leading-tight">
              CLASSES
            </span>
          </div>
        )}
      </div>
    );
  }

  // 1. Icon-only mode (e.g. avatars, receipt seals, mobile header icons)
  if (!showText) {
    const inlineStyle = typeof size === 'number'
      ? { width: `${size}px`, height: `${size}px` }
      : { width: `${iconSize}px`, height: `${iconSize}px` };

    return (
      <div
        id="sunshine-logo-icon"
        className={`inline-flex items-center justify-center shrink-0 select-none bg-transparent ${className}`}
      >
        <img
          src={getLogoSrc(true)}
          alt="Sunshine Classes Emblem"
          style={inlineStyle}
          className="object-contain shrink-0 filter drop-shadow-2xs transition-transform duration-200 hover:scale-105"
          onError={handleImageError}
          loading="eager"
        />
      </div>
    );
  }

  // 2. Full official horizontal logo with branding & tagline
  const imgInlineStyle = typeof size === 'number'
    ? { height: `${size}px`, maxHeight: `${size}px`, width: 'auto' }
    : undefined;

  // Filter out any "pihani" or "hardoi" location mentions from textSubTitle
  const cleanSubtitle = textSubTitle && !textSubTitle.toLowerCase().includes('hardoi') && !textSubTitle.toLowerCase().includes('pihani')
    ? textSubTitle
    : null;

  const content = (
    <div className="flex flex-col items-start bg-transparent shrink-0">
      <img
        src={getLogoSrc(false)}
        alt="Sunshine Classes - Excellence in Education"
        style={imgInlineStyle}
        className={`${getHeightClass()} w-auto shrink-0 object-contain filter drop-shadow-2xs transition-transform duration-200 hover:opacity-95`}
        onError={handleImageError}
        loading="eager"
      />
      {cleanSubtitle && (
        <span
          className={`text-[9.5px] font-bold tracking-[0.16em] uppercase -mt-0.5 pl-0.5 ${
            isLightText ? 'text-amber-300' : 'text-slate-500'
          }`}
        >
          {cleanSubtitle}
        </span>
      )}
    </div>
  );

  return (
    <div
      id="sunshine-logo-container"
      className={`inline-flex items-center shrink-0 select-none bg-transparent ${className}`}
    >
      {content}
    </div>
  );
}
