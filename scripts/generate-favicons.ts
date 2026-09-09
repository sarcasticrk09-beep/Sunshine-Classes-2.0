import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// High-visibility, universal-contrast SVG favicon for Sunshine Classes
// Inspired by YouTube's high-contrast, instantly recognizable squircle badge
function generateSvgFavicon(theme: 'universal' | 'dark' | 'light'): string {
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  // For dark mode tabs: luminous golden amber badge with bright white glowing border
  // For light mode tabs: deep saturated amber-orange badge with crisp dark-accented boundary
  const stop1 = isDark ? '#FBBF24' : isLight ? '#F59E0B' : '#F59E0B';
  const stop2 = isDark ? '#F59E0B' : isLight ? '#EA580C' : '#EA580C';
  const stop3 = isDark ? '#EA580C' : isLight ? '#9A3412' : '#C2410C';

  const strokeColor = isDark
    ? 'rgba(255, 255, 255, 0.75)'
    : isLight
    ? 'rgba(15, 23, 42, 0.28)'
    : 'rgba(255, 255, 255, 0.4)';

  const strokeWidth = isDark ? '4' : isLight ? '3.5' : '3';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="100%" height="100%">
  <defs>
    <!-- Radiant Sunshine Amber-to-Orange Badge Gradient -->
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${stop1}" />
      <stop offset="50%" stop-color="${stop2}" />
      <stop offset="100%" stop-color="${stop3}" />
    </linearGradient>

    <!-- Sun Rays & Glow Gradient -->
    <linearGradient id="sunGlow" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FEF3C7" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <!-- Deep Academic Navy for Open Book -->
    <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F284E" />
      <stop offset="100%" stop-color="#07172E" />
    </linearGradient>
  </defs>

  <!-- Base Squircle Badge (YouTube-style curved tile with 22% radius) -->
  <rect
    x="6"
    y="6"
    width="180"
    height="180"
    rx="42"
    fill="url(#badgeGrad)"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
  />

  <!-- High-contrast Emblem Group -->
  <g id="sunshine-emblem" transform="translate(6, 6) scale(0.9)">
    <!-- ==================== RISING SUN & RAYS ==================== -->
    <g id="rays" fill="url(#sunGlow)">
      <!-- Top Center Ray -->
      <path d="M100 48 C100 24 95 14 100 8 C105 14 100 24 100 48 Z" />
      <!-- Ray Right 1 -->
      <path d="M112 50 C122 28 126 18 133 15 C132 21 123 30 112 50 Z" />
      <!-- Ray Right 2 -->
      <path d="M125 56 C145 38 152 32 161 34 C156 40 143 46 125 56 Z" />
      <!-- Ray Right 3 -->
      <path d="M135 70 C165 60 174 60 183 64 C177 67 161 67 135 70 Z" />
      <!-- Ray Right 4 -->
      <path d="M138 86 C173 89 183 93 190 101 C182 100 168 95 138 86 Z" />

      <!-- Ray Left 1 -->
      <path d="M88 50 C78 28 74 18 67 15 C68 21 77 30 88 50 Z" />
      <!-- Ray Left 2 -->
      <path d="M75 56 C55 38 48 32 39 34 C44 40 57 46 75 56 Z" />
      <!-- Ray Left 3 -->
      <path d="M65 70 C35 60 26 60 17 64 C23 67 39 67 65 70 Z" />
      <!-- Ray Left 4 -->
      <path d="M62 86 C27 89 17 93 10 101 C18 100 32 95 62 86 Z" />
    </g>

    <!-- Sun Ring Arch -->
    <path
      d="M58 92 A 44 44 0 0 1 142 92"
      stroke="#FFFFFF"
      stroke-width="10"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Glowing Sun Disc Base -->
    <ellipse cx="100" cy="94" rx="34" ry="16" fill="#FDE68A" opacity="0.9" />

    <!-- ==================== OPEN BOOK OF KNOWLEDGE ==================== -->
    <!-- Under-glow for book pages -->
    <path d="M100 120 C60 100 28 110 14 126 C28 110 60 100 100 120 Z" fill="#FFFFFF" opacity="0.9" />
    <path d="M100 120 C140 100 172 110 186 126 C172 110 140 100 100 120 Z" fill="#FFFFFF" opacity="0.9" />

    <!-- Left Book Wing (Deep Navy for punchy contrast) -->
    <path
      d="M100 126 C65 106 28 116 14 132 L14 106 C28 90 65 80 100 106 Z"
      fill="url(#bookCoverGrad)"
    />

    <!-- Right Book Wing -->
    <path
      d="M100 126 C135 106 172 116 186 132 L186 106 C172 90 135 80 100 106 Z"
      fill="url(#bookCoverGrad)"
    />

    <!-- Crisp White Page Trim Accents -->
    <path d="M26 112 C44 102 68 96 90 110" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
    <path d="M28 118 C46 108 70 102 90 116" stroke="#FDE68A" stroke-width="2" stroke-linecap="round" opacity="0.9" />

    <path d="M174 112 C156 102 132 96 110 110" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
    <path d="M172 118 C154 108 130 102 110 116" stroke="#FDE68A" stroke-width="2" stroke-linecap="round" opacity="0.9" />

    <!-- Bottom Golden-White Page Spine -->
    <path
      d="M14 132 C50 117 80 117 100 134 C120 117 150 117 186 132 C150 114 120 114 100 131 C80 114 50 114 14 132 Z"
      fill="#FFFFFF"
    />

    <!-- ==================== CENTRAL SCHOLAR / STUDENT SILHOUETTE ==================== -->
    <g id="scholar-silhouette">
      <!-- Head: Brilliant Pure White for 100% legibility -->
      <circle cx="100" cy="78" r="8" fill="#FFFFFF" />
      <!-- Raised-arms Body (Y-shape Victor) -->
      <path
        d="M100 120
           C98 110 93 96 76 86
           C88 90 95 98 100 110
           C105 98 112 90 124 86
           C107 96 102 110 100 120 Z"
        fill="#FFFFFF"
      />
    </g>
  </g>
</svg>`;
}

async function main() {
  const publicDir = path.resolve('public');

  // 1. Generate SVGs: Universal, Dark Mode, and Light Mode
  const universalSvg = generateSvgFavicon('universal');
  const darkSvg = generateSvgFavicon('dark');
  const lightSvg = generateSvgFavicon('light');

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), universalSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon-dark.svg'), darkSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon-light.svg'), lightSvg, 'utf8');
  console.log('✅ Generated public/favicon.svg, favicon-dark.svg, favicon-light.svg');

  // 2. Render crisp multi-resolution PNGs from Universal SVG
  const universalBuffer = Buffer.from(universalSvg);
  const darkBuffer = Buffer.from(darkSvg);
  const lightBuffer = Buffer.from(lightSvg);

  // Standard Universal PNGs
  await sharp(universalBuffer)
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharp(universalBuffer)
    .resize(16, 16)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // Dark-Mode Specific PNGs
  await sharp(darkBuffer)
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-dark-32x32.png'));

  await sharp(darkBuffer)
    .resize(16, 16)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-dark-16x16.png'));

  // Light-Mode Specific PNGs
  await sharp(lightBuffer)
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-light-32x32.png'));

  await sharp(lightBuffer)
    .resize(16, 16)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-light-16x16.png'));

  console.log('✅ Generated theme-specific 16x16 and 32x32 PNGs');

  // Apple Touch Icon and 180x180 favicon
  await sharp(universalBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(universalBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-180x180.png'));

  // PWA App Icons: 192x192 and 512x512
  await sharp(universalBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(universalBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(universalBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-512x512.png'));

  // Standard legacy favicon.ico
  await sharp(universalBuffer)
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ Generated all universal, dark-mode, and light-mode favicon assets');
}

main().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
