import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    // Handle vis-network and vis-data for client-side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // Handle vis-network module resolution for vis-data peer dependency
      try {
        const visDataPath = require.resolve('vis-data/peer/esm/vis-data.js');
        config.resolve.alias = {
          ...config.resolve.alias,
          'vis-data/peer/esm/vis-data.js': visDataPath,
        };
      } catch (e) {
        // If path doesn't exist, try alternative
        try {
          const visDataPath = require.resolve('vis-data');
          config.resolve.alias = {
            ...config.resolve.alias,
            'vis-data/peer/esm/vis-data.js': visDataPath,
          };
        } catch (e2) {
          console.warn('Could not resolve vis-data path:', e2);
        }
      }
    }
    return config;
  },
};

export default nextConfig;
