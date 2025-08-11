/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "tj"], // List of supported locales
    defaultLocale: "en", // Default locale
    localeDetection: false, // Automatically detect user language
  },
};

export default nextConfig;
