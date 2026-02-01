import { NextRequest, NextResponse } from 'next/server';
import { Supermemory } from 'supermemory';

const apiKey = process.env.SUPERMEMORY_API_KEY;

if (!apiKey) {
  throw new Error(
    'The SUPERMEMORY_API_KEY environment variable is missing or empty. ' +
    'Please set it in your .env or .env.local file.'
  );
}

const client = new Supermemory({ apiKey });

// GET: List memories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const containerTags = searchParams.get('containerTags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sort = searchParams.get('sort') || 'updatedAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    const memories = await client.memories.list({
      ...(containerTags?.length && { containerTags }),
      limit,
      sort: sort as 'updatedAt' | 'createdAt',
      order,
    });

    return NextResponse.json(memories);
  } catch (error: any) {
    console.error('List memories error:', error);
    return NextResponse.json(
      { error: 'Failed to list memories', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a URL memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, collection, metadata = {} } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!collection) {
      return NextResponse.json({ error: 'Collection is required' }, { status: 400 });
    }

    const result = await client.memories.add({
      content: url,
      containerTag: collection,
      metadata: {
        type: 'url',
        originalUrl: url,
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Add memory error:', error);
    return NextResponse.json(
      { error: 'Failed to add memory', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a memory
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    await client.memories.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete memory error:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory', details: error.message },
      { status: 500 }
    );
  }
}
