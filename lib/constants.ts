/** Application display name */
export const appName = 'Your App';

/**
 * Maximum file size allowed for uploads in bytes.
 * Must match the `serverActions.bodySizeLimit` and `proxyClientMaxBodySize`
 * values in next.config.mjs.
 */
export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Human-readable maximum file size for display in UI.
 */
export const MAX_UPLOAD_SIZE_DISPLAY = '50MB';
