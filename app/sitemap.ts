import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Popular companies - you can replace with real data from your DB or API
  // For now, we'll keep it empty or add a few example companies
  const popularCompanies: MetadataRoute.Sitemap = [
    // Example: Add top searched companies here
    // {
    //   url: `${baseUrl}/company/514736539`,
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
  ];

  return [...staticPages, ...popularCompanies];
}
