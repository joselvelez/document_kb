/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase body size limit for API routes (e.g., file uploads) to 50MB
  // This replaces the deprecated serverActions.bodySizeLimit which only applies to server actions
  middlewareClientMaxBodySize: '50mb',
};

export default nextConfig;
