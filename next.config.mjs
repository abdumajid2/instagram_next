/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "tj"], // List of supported locales
    defaultLocale: "en", // Default locale
    localeDetection: false, // Automatically detect user language
  },
   images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '37.27.29.18',
        port: '8003',
        pathname: '/images/**', // твои медиа
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**', // аватарки-заглушки
      },
      {
        protocol: 'https',
        hostname: 'www.transparentpng.com',
        pathname: '/download/**', // твой fallback из ошибки
      },
    ],
    // Если у тебя есть ещё домены, добавь их сюда аналогично.
  },
};
export default nextConfig;
