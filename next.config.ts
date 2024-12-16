import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'animation_editor';
const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: isProd ? `/${repoName}/` : '',
  basePath: isProd ? `/${repoName}` : '',
};

export default nextConfig;
