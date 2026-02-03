/**
 * Next.js configuration for the Document KB application.
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    /**
     * Server Actions configuration.
     * Enables Server Actions with a custom body size limit for file uploads.
     *
     * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions
     */
    serverActions: {
      /**
       * Maximum size of the request body sent to a Server Action.
       * Default is 1MB. Increased to 50MB to support large file uploads.
       * Accepts string format: 'b', 'kb', 'mb', 'gb' (e.g., '50mb').
       */
      bodySizeLimit: '50mb',
    },
    /**
     * Maximum size of the request body that the proxy will buffer in memory.
     * When proxy is used, Next.js clones and buffers the request body to enable
     * multiple reads. Default is 10MB. Increased to 50MB for large file uploads.
     *
     * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize
     */
    proxyClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
