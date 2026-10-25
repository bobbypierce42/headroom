import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    cpus: process.env.CI ? 1 : undefined,
  },
  serverExternalPackages: ['typescript', 'twoslash'],
};

export default withMDX(config);
