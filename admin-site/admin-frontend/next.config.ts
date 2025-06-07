import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow production builds to complete even if there are type errors
    ignoreBuildErrors: false,
  },
  
  // Transpile packages that need to be compiled
  transpilePackages: ['tslib', '@apollo/client'],
  
  // Webpack configuration to handle module resolution
  webpack: (config) => {
    // Ensure proper resolution of tslib
    config.resolve.alias = {
      ...config.resolve.alias,
      'tslib': require.resolve('tslib')
    }
    
    // Handle .mjs files properly
    config.resolve.extensions = [
      '.mjs',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json'
    ]
    
    // Configure module resolution for both server and client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    
    return config
  },
};

export default nextConfig;
