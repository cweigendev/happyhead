// Screenshot utilities for capturing 3D model previews

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  quality?: number; // 0.0 to 1.0
  format?: 'image/png' | 'image/jpeg';
}

export class ScreenshotCapture {
  private static instance: ScreenshotCapture;

  static getInstance(): ScreenshotCapture {
    if (!ScreenshotCapture.instance) {
      ScreenshotCapture.instance = new ScreenshotCapture();
    }
    return ScreenshotCapture.instance;
  }

  // Capture screenshot from Canvas element
  async captureCanvasScreenshot(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions = {}
  ): Promise<string | null> {
    try {
      const {
        width = 300,
        height = 300,
        quality = 0.8,
        format = 'image/jpeg'
      } = options;

      console.log('📸 ScreenshotCapture: Capturing canvas screenshot...', { width, height, quality, format });

      // Create a temporary canvas for resizing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error('Failed to get 2D context for temporary canvas');
      }

      tempCanvas.width = width;
      tempCanvas.height = height;

      // Draw the original canvas onto the temp canvas with scaling
      tempCtx.drawImage(canvas, 0, 0, width, height);

      // Convert to data URL
      const dataUrl = tempCanvas.toDataURL(format, quality);

      console.log('✅ ScreenshotCapture: Screenshot captured successfully');
      return dataUrl;

    } catch (error) {
      console.error('❌ ScreenshotCapture: Failed to capture screenshot:', error);
      return null;
    }
  }

  // Find and capture from Three.js canvas
  async captureThreeJSScreenshot(options: ScreenshotOptions = {}): Promise<string | null> {
    try {
      console.log('📸 ScreenshotCapture: Looking for Three.js canvas...');

      // Find the Three.js canvas element
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      
      if (!canvas) {
        console.warn('⚠️ ScreenshotCapture: No canvas element found');
        return null;
      }

      console.log('📸 ScreenshotCapture: Found canvas element');
      
      // Wait a frame to ensure the canvas is fully rendered
      await new Promise(resolve => requestAnimationFrame(resolve));

      return this.captureCanvasScreenshot(canvas, options);

    } catch (error) {
      console.error('❌ ScreenshotCapture: Failed to capture Three.js screenshot:', error);
      return null;
    }
  }

  // Capture with automatic retry for better reliability
  async captureWithRetry(
    maxAttempts: number = 3,
    delay: number = 500,
    options: ScreenshotOptions = {}
  ): Promise<string | null> {
    console.log(`📸 ScreenshotCapture: Starting capture with retry (max ${maxAttempts} attempts)...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`📸 ScreenshotCapture: Attempt ${attempt}/${maxAttempts}`);

      const screenshot = await this.captureThreeJSScreenshot(options);
      
      if (screenshot) {
        console.log(`✅ ScreenshotCapture: Success on attempt ${attempt}`);
        return screenshot;
      }

      if (attempt < maxAttempts) {
        console.log(`⏳ ScreenshotCapture: Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error('❌ ScreenshotCapture: All attempts failed');
    return null;
  }

  // Generate a placeholder thumbnail if screenshot fails
  generatePlaceholderThumbnail(
    productName: string,
    width: number = 300,
    height: number = 300
  ): string {
    try {
      console.log('🖼️ ScreenshotCapture: Generating placeholder thumbnail...');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get 2D context for placeholder canvas');
      }

      canvas.width = width;
      canvas.height = height;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(1, '#7C3AED');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add product name text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Split long product names
      const maxWidth = width - 40;
      const words = productName.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw text lines
      const lineHeight = 25;
      const totalHeight = lines.length * lineHeight;
      const startY = (height - totalHeight) / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
      });

      // Add icon
      ctx.font = '40px system-ui, -apple-system, sans-serif';
      ctx.fillText('📦', width / 2, height / 2 + totalHeight / 2 + 30);

      console.log('✅ ScreenshotCapture: Placeholder thumbnail generated');
      return canvas.toDataURL('image/jpeg', 0.8);

    } catch (error) {
      console.error('❌ ScreenshotCapture: Failed to generate placeholder:', error);
      // Return a minimal data URL if everything fails
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRGNDZFNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UHJvamVjdDwvdGV4dD48L3N2Zz4=';
    }
  }
}

// Export singleton instance
export const screenshotCapture = ScreenshotCapture.getInstance();
