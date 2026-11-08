import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Extracts the clean transparent emblem from logo.svg if emblem_clean_transparent.png does not exist.
 */
async function getOrExtractEmblem(): Promise<Buffer> {
  const emblemPath = path.resolve('emblem_clean_transparent.png');
  if (fs.existsSync(emblemPath)) {
    return fs.readFileSync(emblemPath);
  }

  const logoSvgPath = path.resolve('logo.svg');
  if (!fs.existsSync(logoSvgPath)) {
    throw new Error('logo.svg not found');
  }

  const svgContent = fs.readFileSync(logoSvgPath, 'utf8');
  const m = svgContent.match(/<image[^>]+width="1110"[^>]+xlink:href="data:image\/png;base64,([^"]+)"/);
  if (!m) {
    throw new Error('Could not find embedded logo image in logo.svg');
  }

  const rawBuf = Buffer.from(m[1], 'base64');
  const { data, info } = await sharp(rawBuf)
    .extract({ left: 11, top: 18, width: 1077, height: 760 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  function isWhite(x: number, y: number): boolean {
    const idx = (y * width + x) * channels;
    return data[idx] > 240 && data[idx + 1] > 240 && data[idx + 2] > 240;
  }

  for (let x = 0; x < width; x++) {
    if (isWhite(x, 0)) { visited[0 * width + x] = 1; queue.push(x, 0); }
    if (isWhite(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    if (isWhite(0, y)) { visited[y * width + 0] = 1; queue.push(0, y); }
    if (isWhite(width - 1, y)) { visited[y * width + (width - 1)] = 1; queue.push(width - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy], [cx - 1, cy],
      [cx, cy + 1], [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx] && isWhite(nx, ny)) {
          visited[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const inIdx = idx * channels;
      const outIdx = idx * 4;

      const r = data[inIdx];
      const g = data[inIdx + 1];
      const b = data[inIdx + 2];

      if (visited[idx]) {
        out[outIdx] = 0;
        out[outIdx + 1] = 0;
        out[outIdx + 2] = 0;
        out[outIdx + 3] = 0;
      } else {
        out[outIdx] = r;
        out[outIdx + 1] = g;
        out[outIdx + 2] = b;
        out[outIdx + 3] = 255;
      }
    }
  }

  const cleanBuf = await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  fs.writeFileSync(emblemPath, cleanBuf);
  return cleanBuf;
}

/**
 * Builds high-contrast SVG favicon using the authentic emblem on a crisp squircle badge.
 */
function generateSvgFavicon(theme: 'universal' | 'dark' | 'light', emblemBase64: string): string {
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const strokeColor = isDark
    ? 'url(#goldBorder)'
    : isLight
    ? '#EA580C'
    : 'url(#goldBorder)';

  const strokeWidth = isDark ? '14' : isLight ? '10' : '12';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Radiant Sunshine Amber-to-Orange Badge Gradient Border -->
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>

    <style>
      @media (prefers-color-scheme: dark) {
        .sunshine-badge-border {
          stroke: url(#goldBorder) !important;
          stroke-width: 14px !important;
        }
      }
      @media (prefers-color-scheme: light) {
        .sunshine-badge-border {
          stroke: #EA580C !important;
          stroke-width: 10px !important;
        }
      }
    </style>
  </defs>

  <!-- Base Squircle Badge with White Core for 100% Contrast & Clarity -->
  <rect
    x="16"
    y="16"
    width="480"
    height="480"
    rx="112"
    fill="#FFFFFF"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    class="sunshine-badge-border"
  />

  <!-- Authentic Sunshine Classes Emblem -->
  <image
    x="26"
    y="90"
    width="460"
    height="332"
    href="${emblemBase64}"
    xlink:href="${emblemBase64}"
  />
</svg>`;
}

async function main() {
  const publicDir = path.resolve('public');
  const aistudioAssetsDir = path.resolve('public/assets/aistudio');

  if (!fs.existsSync(aistudioAssetsDir)) {
    fs.mkdirSync(aistudioAssetsDir, { recursive: true });
  }

  console.log('🔄 Extracting/loading clean transparent emblem from logo...');
  const emblemBuffer = await getOrExtractEmblem();
  const emblemBase64 = 'data:image/png;base64,' + emblemBuffer.toString('base64');

  // Save clean emblem into assets
  fs.writeFileSync(path.join(publicDir, 'logo_emblem_transparent.png'), emblemBuffer);
  fs.writeFileSync(path.join(aistudioAssetsDir, 'logo_emblem_transparent.png'), emblemBuffer);
  fs.writeFileSync(path.join(publicDir, 'logo_emblem_light_transparent.png'), emblemBuffer);
  fs.writeFileSync(path.join(aistudioAssetsDir, 'logo_emblem_light_transparent.png'), emblemBuffer);
  console.log('✅ Updated public/logo_emblem_transparent.png and assets with clean emblem');

  // Copy logo.svg into public if available
  const rootLogoSvg = path.resolve('logo.svg');
  if (fs.existsSync(rootLogoSvg)) {
    fs.copyFileSync(rootLogoSvg, path.join(publicDir, 'logo.svg'));
    fs.copyFileSync(rootLogoSvg, path.join(aistudioAssetsDir, 'logo.svg'));
    console.log('✅ Synced logo.svg to public/logo.svg and public/assets/aistudio/logo.svg');
  }

  // 1. Generate SVGs: Universal, Dark Mode, and Light Mode
  const universalSvg = generateSvgFavicon('universal', emblemBase64);
  const darkSvg = generateSvgFavicon('dark', emblemBase64);
  const lightSvg = generateSvgFavicon('light', emblemBase64);

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), universalSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon-dark.svg'), darkSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon-light.svg'), lightSvg, 'utf8');
  console.log('✅ Generated public/favicon.svg, favicon-dark.svg, favicon-light.svg');

  // 2. Render crisp multi-resolution PNGs
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

  console.log('✅ Generated all universal, dark-mode, and light-mode favicon assets from official logo emblem');
}

main().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
