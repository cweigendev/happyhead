# Satoshi Font Implementation Guide

## Current Status
Currently using **Inter** as a placeholder font that closely resembles Satoshi.

## To Add Actual Satoshi Fonts:

### Step 1: Obtain Satoshi Font Files
Download Satoshi font files from the official source and place them in this directory:
- `Satoshi-Light.woff2`
- `Satoshi-Regular.woff2`
- `Satoshi-Medium.woff2`
- `Satoshi-Bold.woff2`
- `Satoshi-Black.woff2`
- `SatoshiMono-Regular.woff2`

### Step 2: Update layout.tsx
Replace the current Inter import with localFont:

```typescript
import localFont from "next/font/local";

const satoshi = localFont({
  src: [
    {
      path: './fonts/Satoshi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Satoshi-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: "--font-satoshi",
  display: 'swap',
});

const satoshiMono = localFont({
  src: './fonts/SatoshiMono-Regular.woff2',
  variable: "--font-satoshi-mono",
  weight: '400',
  display: 'swap',
});
```

### Step 3: Font Weights Available
- Light: 300
- Regular: 400
- Medium: 500
- Bold: 700
- Black: 900

### Step 4: Usage in Components
The fonts are automatically available via Tailwind CSS:
- `font-sans` - Uses Satoshi
- `font-mono` - Uses Satoshi Mono
- `font-light` - Weight 300
- `font-normal` - Weight 400
- `font-medium` - Weight 500
- `font-bold` - Weight 700
- `font-black` - Weight 900

### License Note
Ensure you have proper licensing for Satoshi font before using in production.

### Current Fallback
Using Inter font which provides similar characteristics to Satoshi.
