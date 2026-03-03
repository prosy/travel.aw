import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@travel/skill-runner'],
  outputFileTracingIncludes: {
    '/seattle/*': ['../../data/seattle/**'],
    '/seattle/while-in-seattle/*': ['../../data/seattle/**'],
    '/api/seattle/*': ['../../data/seattle/**'],
  },
};

export default nextConfig;
