import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tradematch.example.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/profile/',
        '/jobs/',
        '/certifications/',
        '/prep/',
        '/design-test/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
