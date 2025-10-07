import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },

  // Cloudflare Pages 兼容性配置
  output: process.env.CF_PAGES ? 'standalone' : undefined,

  // 禁用生产构建缓存（避免超过 Cloudflare 25MB 限制）
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // 开发环境配置
  reactStrictMode: false,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }

    // 生产环境禁用文件系统缓存（Cloudflare Pages）
    if (!dev && process.env.CF_PAGES) {
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;
