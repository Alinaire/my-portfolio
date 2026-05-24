import { useEffect, useState } from 'react';
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';

const FRONT_SIZE = 2048;
const BACK_SIZE = 2048;
const FABRIC_SIZE = 1024;
const IMPERFECTION_SIZE = 1024;

function createCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create 2D canvas context.');
  }

  return { canvas, ctx };
}

function applyTextureDefaults(texture, repeat = false) {
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 8;
  texture.wrapS = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  texture.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function seedFromString(input) {
  let seed = 0;

  for (let index = 0; index < input.length; index += 1) {
    seed = (seed * 31 + input.charCodeAt(index)) >>> 0;
  }

  return seed || 1;
}

function createRng(seedValue) {
  let seed = seedValue >>> 0;

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function fillTextBlock(ctx, text, x, y, options = {}) {
  const {
    size = 42,
    weight = 700,
    family = 'Space Grotesk, sans-serif',
    color = '#101827',
    lineHeight = 1.2,
    letterSpacing = 0,
    maxWidth,
    align = 'left',
  } = options;

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = align;

  const lines = String(text).split('\n');
  lines.forEach((line, index) => {
    if (letterSpacing === 0) {
      ctx.fillText(line, x, y + index * size * lineHeight);
      return;
    }

    let offsetX = 0;
    for (const char of line) {
      const charWidth = ctx.measureText(char).width;
      ctx.fillText(char, x + offsetX, y + index * size * lineHeight);
      offsetX += charWidth + letterSpacing;
      if (maxWidth && offsetX > maxWidth) break;
    }
  });

  ctx.restore();
}

function drawBarcode(ctx, x, y, width, height, seed) {
  const rng = createRng(seed);
  let cursor = x;

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = '#101827';
  while (cursor < x + width) {
    const barWidth = Math.max(2, Math.floor((rng() * 7 + 1) * (width / 360)));
    const gap = Math.max(1, Math.floor((rng() * 4 + 1) * (width / 520)));
    ctx.fillRect(cursor, y, barWidth, height);
    cursor += barWidth + gap;
  }

  ctx.restore();
}

function createFrontTexture(image, palette) {
  const { canvas, ctx } = createCanvas(FRONT_SIZE);
  const margin = 96;
  const headerHeight = 328;
  const photoX = margin;
  const photoY = 396;
  const photoW = 496;
  const photoH = 592;
  const rightStart = 650;

  const bg = ctx.createLinearGradient(0, 0, 0, FRONT_SIZE);
  bg.addColorStop(0, '#fcfbf6');
  bg.addColorStop(0.42, palette.surfaceStrong || '#ffffff');
  bg.addColorStop(1, '#efe7d9');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, FRONT_SIZE, FRONT_SIZE);

  const glow = ctx.createRadialGradient(1550, 220, 24, 1550, 220, 760);
  glow.addColorStop(0, 'rgba(255,255,255,0.65)');
  glow.addColorStop(0.4, 'rgba(255,255,255,0.18)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, FRONT_SIZE, FRONT_SIZE);

  const header = ctx.createLinearGradient(0, 0, FRONT_SIZE, headerHeight);
  header.addColorStop(0, palette.accentStrong || '#115e59');
  header.addColorStop(0.7, palette.accent || '#0f766e');
  header.addColorStop(1, '#18a199');
  ctx.fillStyle = header;
  ctx.fillRect(0, 0, FRONT_SIZE, headerHeight);

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, 86, FRONT_SIZE, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, FRONT_SIZE, 44);

  fillTextBlock(ctx, 'PORTFOLIO ID', margin, 76, {
    size: 34,
    weight: 700,
    family: 'Manrope, sans-serif',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 9,
  });

  fillTextBlock(ctx, 'Full Stack Developer', margin, 132, {
    size: 74,
    weight: 800,
    family: 'Space Grotesk, sans-serif',
    color: '#ffffff',
  });

  roundRect(ctx, FRONT_SIZE - margin - 122, 70, 122, 122, 32);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  ctx.stroke();
  fillTextBlock(ctx, 'AC', FRONT_SIZE - margin - 89, 103, {
    size: 38,
    weight: 800,
    family: 'Space Grotesk, sans-serif',
    color: '#ffffff',
  });

  const photoRadius = 34;
  roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (image) {
    const imageRatio = image.width / image.height;
    const targetRatio = photoW / photoH;
    let drawWidth = photoW;
    let drawHeight = photoH;
    let offsetX = photoX;
    let offsetY = photoY;

    if (imageRatio > targetRatio) {
      drawWidth = photoH * imageRatio;
      offsetX = photoX - (drawWidth - photoW) / 2;
    } else {
      drawHeight = photoW / imageRatio;
      offsetY = photoY - (drawHeight - photoH) / 2;
    }

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  const photoFade = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
  photoFade.addColorStop(0, 'rgba(255,255,255,0.08)');
  photoFade.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = photoFade;
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.restore();
  ctx.strokeStyle = 'rgba(16, 24, 39, 0.18)';
  ctx.lineWidth = 4;
  ctx.stroke();

  fillTextBlock(ctx, 'Alinaire\nCunan', rightStart, 424, {
    size: 104,
    weight: 800,
    family: 'Space Grotesk, sans-serif',
    color: '#101827',
    lineHeight: 1.02,
  });

  fillTextBlock(ctx, 'Full Stack Web Developer', rightStart, 640, {
    size: 42,
    weight: 600,
    family: 'Manrope, sans-serif',
    color: palette.muted || '#52606d',
  });

  const rows = [
    { label: 'STACK', value: 'React / Laravel' },
    { label: 'LOCATION', value: 'Philippines' },
    { label: 'STATUS', value: 'Available', valueColor: '#14a34a', valueWeight: 800 },
  ];

  let rowTop = 810;
  rows.forEach((row, index) => {
    if (index > 0) {
      ctx.strokeStyle = 'rgba(16,24,39,0.1)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rightStart, rowTop - 30);
      ctx.lineTo(FRONT_SIZE - margin, rowTop - 30);
      ctx.stroke();
    }

    fillTextBlock(ctx, row.label, rightStart, rowTop, {
      size: 26,
      weight: 700,
      family: 'Manrope, sans-serif',
      color: palette.muted || '#52606d',
      letterSpacing: 5,
    });
    fillTextBlock(ctx, row.value, FRONT_SIZE - margin, rowTop, {
      size: 34,
      weight: row.valueWeight || 600,
      family: 'Manrope, sans-serif',
      color: row.valueColor || '#101827',
      align: 'right',
    });
    rowTop += 116;
  });

  const footerY = 1320;
  roundRect(ctx, margin, footerY, FRONT_SIZE - margin * 2, 540, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.46)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(16,24,39,0.08)';
  ctx.lineWidth = 3;
  ctx.stroke();

  fillTextBlock(ctx, 'PORTFOLIO', margin + 30, footerY + 34, {
    size: 22,
    weight: 700,
    family: 'Manrope, sans-serif',
    color: palette.muted || '#52606d',
    letterSpacing: 6,
  });

  fillTextBlock(ctx, 'alinairecunan.dev', margin + 30, footerY + 88, {
    size: 46,
    weight: 800,
    family: 'Space Grotesk, sans-serif',
    color: '#101827',
  });

  fillTextBlock(ctx, 'Design-minded portfolio ID', margin + 30, footerY + 160, {
    size: 26,
    weight: 600,
    family: 'Manrope, sans-serif',
    color: palette.muted || '#52606d',
    letterSpacing: 2,
  });

  fillTextBlock(ctx, 'React / Laravel / APIs / Databases', margin + 30, footerY + 230, {
    size: 34,
    weight: 700,
    family: 'Space Grotesk, sans-serif',
    color: '#101827',
  });

  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#101827';
  for (let index = 0; index < 18; index += 1) {
    const y = 115 + index * 96;
    ctx.fillRect(0, y, FRONT_SIZE, 2);
  }
  ctx.globalAlpha = 1;

  const texture = applyTextureDefaults(new CanvasTexture(canvas));
  texture.needsUpdate = true;
  return texture;
}

function createBackTexture(palette) {
  const { canvas, ctx } = createCanvas(BACK_SIZE);
  const margin = 112;

  const bg = ctx.createLinearGradient(0, 0, BACK_SIZE, BACK_SIZE);
  bg.addColorStop(0, '#f4efe6');
  bg.addColorStop(1, '#e8dfd0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, BACK_SIZE, BACK_SIZE);

  const band = ctx.createLinearGradient(0, 0, BACK_SIZE, 0);
  band.addColorStop(0, palette.accentStrong || '#115e59');
  band.addColorStop(1, palette.accent || '#0f766e');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, BACK_SIZE, 160);

  fillTextBlock(ctx, 'BACK OF ID', margin, 54, {
    size: 30,
    weight: 700,
    family: 'Manrope, sans-serif',
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 8,
  });

  fillTextBlock(ctx, 'Alinaire Cunan', margin, 244, {
    size: 74,
    weight: 800,
    family: 'Space Grotesk, sans-serif',
    color: '#101827',
  });
  fillTextBlock(ctx, 'Portfolio and contact details', margin, 320, {
    size: 32,
    weight: 600,
    family: 'Manrope, sans-serif',
    color: palette.muted || '#52606d',
  });

  roundRect(ctx, margin, 420, 760, 176, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.58)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(16,24,39,0.08)';
  ctx.lineWidth = 3;
  ctx.stroke();
  fillTextBlock(ctx, 'This card is designed as a premium portfolio badge with a soft matte finish, holographic sheen, and a physically believable lanyard system.', margin + 28, 446, {
    size: 24,
    weight: 600,
    family: 'Manrope, sans-serif',
    color: '#39424e',
    lineHeight: 1.35,
  });

  drawBarcode(ctx, margin, 680, 860, 144, seedFromString('barcode-' + palette.accent));

  fillTextBlock(ctx, 'STUDENT / STAFF / MEMBER', margin, 880, {
    size: 28,
    weight: 700,
    family: 'Manrope, sans-serif',
    color: palette.muted || '#52606d',
    letterSpacing: 4,
  });
  fillTextBlock(ctx, 'React / Laravel / APIs / Databases', margin, 934, {
    size: 38,
    weight: 700,
    family: 'Space Grotesk, sans-serif',
    color: '#101827',
  });

  roundRect(ctx, margin, 1114, BACK_SIZE - margin * 2, 166, 28);
  ctx.fillStyle = 'rgba(16,24,39,0.92)';
  ctx.fill();
  fillTextBlock(ctx, 'Keep away from excessive heat, bending, or abrasion. The finish is intentionally premium with light reflective coating for cinematic lighting.', margin + 26, 1143, {
    size: 22,
    weight: 500,
    family: 'Manrope, sans-serif',
    color: 'rgba(255,255,255,0.84)',
    lineHeight: 1.35,
  });

  ctx.strokeStyle = 'rgba(16,24,39,0.08)';
  ctx.lineWidth = 2;
  for (let index = 0; index < 10; index += 1) {
    ctx.beginPath();
    ctx.moveTo(margin, 1460 + index * 44);
    ctx.lineTo(BACK_SIZE - margin, 1460 + index * 44);
    ctx.stroke();
  }

  fillTextBlock(ctx, 'alinairecunan.dev', margin, 1816, {
    size: 42,
    weight: 800,
    family: 'Space Grotesk, sans-serif',
    color: '#101827',
  });
  fillTextBlock(ctx, 'Premium portfolio identity card', margin, 1870, {
    size: 24,
    weight: 600,
    family: 'Manrope, sans-serif',
    color: palette.muted || '#52606d',
    letterSpacing: 2,
  });

  const texture = applyTextureDefaults(new CanvasTexture(canvas));
  texture.needsUpdate = true;
  return texture;
}

export function createFabricTexture(palette) {
  const { canvas, ctx } = createCanvas(FABRIC_SIZE);
  const base = ctx.createLinearGradient(0, 0, 0, FABRIC_SIZE);
  base.addColorStop(0, palette.accentStrong || '#115e59');
  base.addColorStop(1, palette.accent || '#0f766e');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, FABRIC_SIZE, FABRIC_SIZE);

  const edgeFade = ctx.createLinearGradient(0, 0, 112, 0);
  edgeFade.addColorStop(0, 'rgba(6, 25, 23, 0.34)');
  edgeFade.addColorStop(1, 'rgba(6, 25, 23, 0)');
  ctx.fillStyle = edgeFade;
  ctx.fillRect(0, 0, 112, FABRIC_SIZE);
  ctx.save();
  ctx.scale(-1, 1);
  ctx.fillStyle = edgeFade;
  ctx.fillRect(-FABRIC_SIZE, 0, 112, FABRIC_SIZE);
  ctx.restore();

  const centerBand = ctx.createLinearGradient(FABRIC_SIZE * 0.36, 0, FABRIC_SIZE * 0.64, 0);
  centerBand.addColorStop(0, 'rgba(255,255,255,0)');
  centerBand.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  centerBand.addColorStop(0.55, 'rgba(255,255,255,0.14)');
  centerBand.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = centerBand;
  ctx.fillRect(0, 0, FABRIC_SIZE, FABRIC_SIZE);

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(FABRIC_SIZE * 0.495 - 4, 0, 8, FABRIC_SIZE);
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.24;
  ctx.fillStyle = '#0b2f2b';
  for (let index = -2; index < 20; index += 1) {
    ctx.save();
    ctx.translate(index * 72, -120);
    ctx.rotate(Math.PI / 6);
    ctx.fillRect(0, 0, 32, FABRIC_SIZE + 260);
    ctx.restore();
  }

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  for (let index = -3; index < 24; index += 1) {
    ctx.save();
    ctx.translate(index * 58, -160);
    ctx.rotate(-Math.PI / 6);
    ctx.fillRect(0, 0, 12, FABRIC_SIZE + 320);
    ctx.restore();
  }

  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, FABRIC_SIZE, FABRIC_SIZE);

  const texture = applyTextureDefaults(new CanvasTexture(canvas), true);
  texture.repeat.set(1.2, 8);
  texture.needsUpdate = true;
  return texture;
}

function createImperfectionTexture() {
  const { canvas, ctx } = createCanvas(IMPERFECTION_SIZE);
  const rng = createRng(839201);

  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, IMPERFECTION_SIZE, IMPERFECTION_SIZE);

  for (let index = 0; index < 42; index += 1) {
    const x = rng() * IMPERFECTION_SIZE;
    const y = rng() * IMPERFECTION_SIZE;
    const length = 60 + rng() * 280;
    const angle = rng() * Math.PI * 2;
    const alpha = 0.05 + rng() * 0.1;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 1 + rng() * 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-length * 0.5, 0);
    ctx.lineTo(length * 0.5, 0);
    ctx.stroke();
    ctx.restore();
  }

  for (let index = 0; index < 14; index += 1) {
    const x = rng() * IMPERFECTION_SIZE;
    const y = rng() * IMPERFECTION_SIZE;
    const radiusX = 50 + rng() * 130;
    const radiusY = 36 + rng() * 90;
    const alpha = 0.045 + rng() * 0.06;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rng() * Math.PI);
    ctx.scale(radiusX / 80, radiusY / 80);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = applyTextureDefaults(new CanvasTexture(canvas));
  texture.needsUpdate = true;
  return texture;
}

export function useDocumentFontsReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      setReady(true);
      return undefined;
    }

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(markReady);
    } else {
      markReady();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function useIdCardTextures(image, palette) {
  const fontsReady = useDocumentFontsReady();
  const [textures, setTextures] = useState(null);

  useEffect(() => {
    if (!fontsReady || !image) return undefined;

    const front = createFrontTexture(image, palette);
    const back = createBackTexture(palette);
    const fabric = createFabricTexture(palette);
    const imperfections = createImperfectionTexture();

    setTextures({
      front,
      back,
      fabric,
      imperfections,
    });

    return () => {
      front.dispose();
      back.dispose();
      fabric.dispose();
      imperfections.dispose();
    };
  }, [fontsReady, image, palette]);

  return textures;
}
