export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/landing', '/login', '/register'],
        disallow: [
          '/dashboard',
          '/dashboard-*',
          '/api/',
          '/reset-password',
        ],
      },
    ],
    sitemap: 'https://fleetflow-ten.vercel.app/sitemap.xml',
  };
}
