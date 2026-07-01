// ✏️ EDITABLE — theme the ads to match this site. Devs own this file.
// You control the LOOK here (radius, border, shadow, background, label color).
// You CANNOT change the ad's shape/fit from here — that stays locked in
// src/lib/ad-slots.ts, so the ad always displays correctly no matter what.

import type { AdSkin } from '@/lib/ads/ad-frame'

// Site-wide default skin — premium directory look: soft radius, hairline
// border, gentle shadow, matches the `--slot4-*` card language.
export const adSkin: AdSkin = {
  radius: '16px',
  border: '1px solid rgba(20,20,20,0.08)',
  shadow: '0 8px 30px rgba(0,0,0,0.06)',
  background: '#ffffff',
  labelClassName: 'bg-[#d32323] text-white',
}

// Per-slot overrides — one deliberate skin per real ad slot
// (header, sidebar, in-feed, article-bottom, footer, popup).
export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  header: { radius: '20px', border: '1px solid rgba(20,20,20,0.06)', background: '#fafafa' },
  sidebar: { radius: '14px', shadow: 'none', border: '1px solid rgba(20,20,20,0.08)' },
  'in-feed': { radius: '18px', shadow: '0 10px 34px rgba(0,0,0,0.08)', background: '#ffffff' },
  'article-bottom': { radius: '16px', border: '1px solid rgba(20,20,20,0.08)', background: '#f6f6f7' },
  footer: { radius: '14px', border: '1px solid rgba(255,255,255,0.14)', background: '#1c1c20', labelClassName: 'bg-[#d32323] text-white' },
  popup: { radius: '24px', shadow: '0 24px 60px rgba(0,0,0,0.28)' },
}

/** Merge site default + per-slot override for a slot. */
export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
