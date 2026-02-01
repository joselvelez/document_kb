import { NextResponse } from 'next/server';
import { Supermemory } from 'supermemory';

const apiKey = process.env.SUPERMEMORY_API_KEY;

if (!apiKey) {
  throw new Error(
    'The SUPERMEMORY_API_KEY environment variable is missing or empty. ' +
    'Please set it in your .env or .env.local file.'
  );
}

const client = new Supermemory({ apiKey });

// GET: List all collections
export async function GET() {
  try {
    // Get all memories and extract unique collection tags
    const memories = await client.memories.list({
      limit: 1000,
    });

    const collectionsSet = new Set<string>();

    memories.memories.forEach((memory) => {
      if (memory.containerTags && Array.isArray(memory.containerTags)) {
        memory.containerTags.forEach((tag) => collectionsSet.add(tag));
      }
    });

    const collections = Array.from(collectionsSet).sort();
    return NextResponse.json({ collections });
  } catch (error: any) {
    console.error('List collections error:', error);
    return NextResponse.json(
      { error: 'Failed to list collections', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Validate and create a new collection (collections are created implicitly when adding documents)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const collectionName = name.trim();

    // Check if collection already exists
    const memories = await client.memories.list({
      limit: 1000,
    });

    const existingCollections = new Set<string>();
    memories.memories.forEach((memory) => {
      if (memory.containerTags && Array.isArray(memory.containerTags)) {
        memory.containerTags.forEach((tag) => existingCollections.add(tag));
      }
    });

    if (existingCollections.has(collectionName)) {
      return NextResponse.json(
        { error: 'A collection with this name already exists' },
        { status: 409 }
      );
    }

    // Note: In Supermemory, collections are just tags on memories.
    // A collection "exists" when at least one memory has that containerTag.
    // For validation purposes, we just return success here.
    // The actual collection will be created when the first document is added.
    return NextResponse.json({
      success: true,
      message: `Collection "${collectionName}" is ready to be created`,
    });
  } catch (error: any) {
    console.error('Create collection error:', error);
    return NextResponse.json(
      { error: 'Failed to create collection', details: error.message },
      { status: 500 }
    );
  }
}
