'use server';

import { Supermemory, toFile } from 'supermemory';

const apiKey = process.env.SUPERMEMORY_API_KEY;

if (!apiKey) {
  throw new Error(
    'The SUPERMEMORY_API_KEY environment variable is missing or empty. ' +
      'Please set it in your .env or .env.local file.'
  );
}

const client = new Supermemory({ apiKey });

/**
 * Response type for the uploadDocument server action.
 */
export interface UploadDocumentResponse {
  success: boolean;
  documentId?: string;
  message?: string;
  error?: string;
  details?: string;
}

/**
 * Server action to upload a document file to Supermemory.
 *
 * This action handles file uploads via FormData, converting the File to the
 * format required by the Supermemory SDK and uploading it with the specified
 * container tags and metadata.
 *
 * @param formData - FormData containing:
 *   - file: The File object to upload
 *   - containerTags: JSON string array of container tags (e.g., '["collection-name"]')
 *   - metadata: Optional JSON string of metadata object
 * @returns Promise<UploadDocumentResponse> with success status and document ID, or error details
 * @throws Never throws - all errors are caught and returned in the response object
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', file);
 * formData.append('containerTags', JSON.stringify(['my-collection']));
 * formData.append('metadata', JSON.stringify({ uploadedBy: 'user' }));
 * const result = await uploadDocument(formData);
 * if (!result.success) {
 *   console.error(result.error);
 * }
 * ```
 */
export async function uploadDocument(
  formData: FormData
): Promise<UploadDocumentResponse> {
  const file = formData.get('file') as File | null;
  const containerTagsRaw = formData.get('containerTags') as string | null;
  const metadataRaw = formData.get('metadata') as string | null;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  if (!containerTagsRaw) {
    return { success: false, error: 'No containerTags provided' };
  }

  let containerTagsArray: string[];
  try {
    containerTagsArray = JSON.parse(containerTagsRaw) as string[];
  } catch {
    return { success: false, error: 'Invalid containerTags format - must be JSON array string' };
  }

  let metadataObj: Record<string, unknown> = {};
  if (metadataRaw) {
    try {
      metadataObj = JSON.parse(metadataRaw) as Record<string, unknown>;
    } catch {
      return { success: false, error: 'Invalid metadata format - must be JSON object string' };
    }
  }

  try {
    const uploadableFile = await toFile(file, file.name, { type: file.type });

    const result = await client.memories.uploadFile({
      file: uploadableFile,
      containerTags: JSON.stringify(containerTagsArray),
      metadata: JSON.stringify(metadataObj),
    });

    return {
      success: true,
      documentId: result.id,
      message: 'Document uploaded successfully',
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: 'Upload failed',
      details: errorMessage,
    };
  }
}
