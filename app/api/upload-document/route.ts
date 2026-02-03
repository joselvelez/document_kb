import { NextRequest, NextResponse } from 'next/server';
import { Supermemory, toFile } from 'supermemory';

// Configure body size limit for this route (50MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

const apiKey = process.env.SUPERMEMORY_API_KEY;

if (!apiKey) {
  throw new Error(
    'The SUPERMEMORY_API_KEY environment variable is missing or empty. ' +
    'Please set it in your .env or .env.local file.'
  );
}

const client = new Supermemory({ apiKey });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const containerTagsArray = JSON.parse(formData.get('containerTags') as string) as string[];
    const metadataObj = JSON.parse((formData.get('metadata') as string) || '{}');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Uploadable format for Supermemory using toFile helper
    const uploadableFile = await toFile(file, file.name, { type: file.type });

    // Per Supermemory SDK: containerTags must be a JSON STRING (not array)
    // "Can be either a JSON string of an array (e.g., '["user_123"]') or a single string"
    // metadata must also be a JSON string
    const result = await client.memories.uploadFile({
      file: uploadableFile,
      containerTags: JSON.stringify(containerTagsArray),
      metadata: JSON.stringify(metadataObj),
    });

    return NextResponse.json({
      success: true,
      documentId: result.id,
      message: 'Document uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}
