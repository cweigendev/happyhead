import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable for large file handling
    largePageDataBytes: 128 * 1024, // 128KB
  },
  // Optimize static file serving for large GLB files
  async headers() {
    return [
      {
        source: '/models/:path*.glb',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'model/gltf-binary',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
