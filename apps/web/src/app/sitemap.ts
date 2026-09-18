import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of the application
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tradematch.example.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Note: Do NOT include authenticated routes inside (app)/
    // like /home, /jobs, /profile, /certifications, /prep
    // as they require authentication and shouldn't be indexed.
  ];
}
