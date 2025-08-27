# Artwork Directory

This directory contains artwork/texture files that can be applied to the jar model.

## Current Artwork Files:
- `logo1.jpg` - Company logo design
- `pattern1.jpg` - Pattern design
- `label1.jpg` - Product label design

## Adding New Artwork:
1. Add your image files (JPG, PNG) to this directory
2. Update the `artworkOptions` array in `CustomizationSidebar.tsx`
3. Ensure images are optimized for UV mapping (power of 2 dimensions recommended)

## Image Requirements:
- Format: JPG, PNG
- Resolution: 512x512, 1024x1024, or 2048x2048
- File size: Under 5MB
- UV mapping compatible
