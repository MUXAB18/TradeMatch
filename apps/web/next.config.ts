import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n.ts'
);

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"]
};

export default withNextIntl(nextConfig);
